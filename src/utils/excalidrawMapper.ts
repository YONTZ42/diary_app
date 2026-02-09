import type { ExcalidrawElement, ExcalidrawImageElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import { Page, AssetRef } from "@/types/schema";

// 読み込み用: AssetRef -> Excalidraw BinaryFiles
export const mapAssetsToExcalidrawFiles = (assets: Record<string, AssetRef>) => {
  const files: Record<string, any> = {};
  
  if (!assets) return files;

  Object.entries(assets).forEach(([id, asset]) => {
    // S3 (remote) の場合はURLを、localの場合はBase64などをそのまま渡す
    // Excalidrawは http... から始まるURLを自動でフェッチして表示できる
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

// 保存用: Excalidraw BinaryFiles -> AssetRef
export const extractPageDataFromExcalidraw = (
  elements: readonly ExcalidrawElement[],
  appState: any,
  files: BinaryFiles
): Pick<Page, 'sceneData' | 'assets'> => {
  
  const assets: Record<string, AssetRef> = {};

  // 1. 使用されている fileId のセットを作成
  const usedFileIds = new Set<string>();
  elements.forEach(element => {
    if (element.type === 'image' && !element.isDeleted) {
      const imgEl = element as ExcalidrawImageElement;
      if (imgEl.fileId) {
        usedFileIds.add(imgEl.fileId);
      }
    }
  });

  // 2. 使用されているファイルのみを assets に登録
  Object.entries(files).forEach(([fileId, binaryFile]) => {
    // 削除済み、またはキャンバス上に存在しない画像は保存しない
    if (!usedFileIds.has(fileId)) return;
    
    if (!binaryFile.dataURL) return;

    const dataURL = binaryFile.dataURL;
    const isRemote = dataURL.startsWith('http');

    assets[fileId] = {
      kind: isRemote ? 'remote' : 'local',
      key: dataURL,
      mime: binaryFile.mimeType,
      // ...
    } as AssetRef;
  });

  return {
    sceneData: {
      elements,
      appState
    },
    assets
  };
};
