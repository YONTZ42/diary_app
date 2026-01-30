// src/components/PageCanvas/utils.ts

// 必要な型（DataURLも追加）をインポート
import type { BinaryFiles, FileId, DataURL } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { Page, AssetRef } from "../types/schema";

// シーンデータ(unknown)をExcalidrawの型にキャスト
export const parseScene = (scene: unknown): ExcalidrawElement[] => {
  return (scene as ExcalidrawElement[]) || [];
};

// AssetRef から Excalidraw の BinaryFiles 形式へ変換（プレビュー用）
export const resolveAssetsToBinaryFiles = (assets: Page["assets"]): BinaryFiles => {
  const files: BinaryFiles = {};
  
  Object.entries(assets).forEach(([id, assetRef]) => {
    // 実際の実装では、ここで assetRef.key を元に画像のURLを取得します
    const dummyUrl = `https://dummyimage.com/${assetRef.width || 100}x${assetRef.height || 100}/eee/aaa&text=${assetRef.key}`;
    
    // 文字列をExcalidraw固有の型にキャスト
    const fileId = id as FileId;
    const dataUrl = dummyUrl as DataURL; // ★ここを修正

    files[fileId] = {
      id: fileId,
      dataURL: dataUrl, // キャストした値を渡す
      mimeType: assetRef.mime as any,
      created: Date.now(),
      lastRetrieved: Date.now(),
    };
  });
  
  return files;
};