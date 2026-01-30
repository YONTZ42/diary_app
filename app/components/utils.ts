// src/components/PageCanvas/utils.ts
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

// ...省略...

import { Page, AssetRef } from "../types/schema";

// シーンデータ(unknown)をExcalidrawの型にキャスト
export const parseScene = (scene: unknown): ExcalidrawElement[] => {
  return (scene as ExcalidrawElement[]) || [];
};

// AssetRef から Excalidraw の BinaryFiles 形式へ変換（プレビュー用）
// ※実際にはここで Blob URL や Cloud Storage の URL を解決する処理が入ります
export const resolveAssetsToBinaryFiles = (assets: Page["assets"]): BinaryFiles => {
  const files: BinaryFiles = {};
  
  Object.entries(assets).forEach(([id, assetRef]) => {
    // 実際の実装では、ここで assetRef.key を元に画像のURLを取得します
    // 仮実装として placeholder を入れています
    const dummyUrl = `https://dummyimage.com/${assetRef.width || 100}x${assetRef.height || 100}/eee/aaa&text=${assetRef.key}`;
    
    files[id] = {
      id,
      dataURL: dummyUrl, // 本番では非同期でBlobを取得してdataURL化、あるいはURLを渡す
      mimeType: assetRef.mime as any,
      created: Date.now(),
      lastRetrieved: Date.now(),
    };
  });
  
  return files;
};