// utils/excalidrawMapper.ts
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import { Page, AssetRef } from "@/types/schema";

// ... (mapAssetsToExcalidrawFiles はそのまま) ...

export const mapAssetsToExcalidrawFiles = (assets: Record<string, AssetRef>) => {
  const files: Record<string, any> = {};
  
  Object.entries(assets).forEach(([id, asset]) => {
    files[id] = {
      id,
      dataURL: asset.key, 
      mimeType: asset.mime,
      created: Date.now(),
      lastRetrieved: Date.now()
    };
  });
  
  return files;
};

/**
 * ExcalidrawのデータからPageの形式へ戻す（保存時用）
 * Excalidrawの files (BinaryFiles) を Page.assets (AssetRef) に変換します。
 */
export const extractPageDataFromExcalidraw = (
  elements: readonly ExcalidrawElement[],
  appState: any,
  files: BinaryFiles
): Pick<Page, 'sceneData' | 'assets'> => {
  
  const assets: Record<string, AssetRef> = {};

  // Excalidrawのfilesオブジェクトを走査
  Object.entries(files).forEach(([fileId, binaryFile]) => {
    // データURL (Base64) が存在する場合のみ保存
    if (binaryFile.dataURL) {
      assets[fileId] = {
        kind: 'local', // ローカル保存扱い
        key: binaryFile.dataURL, // MVPではBase64文字列をそのままkeyに入れる(localStorage容量注意)
        mime: binaryFile.mimeType,
        width: undefined, // 必要なら画像ロードして取得だが、一旦省略
        height: undefined,
        createdAt: new Date().toISOString(), // AssetRefLiteにはないが拡張用
        updatedAt: new Date().toISOString()
      } as AssetRef;
    }
  });

  return {
    sceneData: {
      elements,
      appState
    },
    assets
  };
};