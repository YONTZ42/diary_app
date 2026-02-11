import type { ExcalidrawElement, ExcalidrawImageElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import { Page, AssetRef, ExcalidrawSceneData } from "@/types/schema";

const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

// API由来の elements は unknown 混じりになりやすいので、最低限のshapeでフィルタ
const isExcalidrawElementLike = (v: unknown): v is ExcalidrawElement => {
  if (!isObj(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.type === "string" &&
    typeof v.x === "number" &&
    typeof v.y === "number"
  );
};

export function prepareExcalidrawData(page: Page): ExcalidrawInitialDataState {
  const raw = page.sceneData?.elements;
  const rawElements: unknown[] = Array.isArray(raw) ? raw : [];
  const normalizedElements: ExcalidrawElement[] = rawElements.filter(isExcalidrawElementLike);

  let elements: ExcalidrawElement[] = normalizedElements;

  const hasFrame = elements.find((el) => el.id === FRAME_ID && !(el as any)?.isDeleted);

  if (!hasFrame) {
    // rectangle互換のフレーム（最低限+αのフィールドを入れてキャスト）
    const frame = {
      type: "rectangle",
      id: FRAME_ID,
      x: 0, y: 0, width: FRAME_W, height: FRAME_H,
      angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent",
      fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
      roughness: 0, opacity: 100, locked: true,
      version: 1, isDeleted: false,
      seed: 1,
      versionNonce: 1,
      groupIds: [],
      boundElements: null,
      link: null,
      updated: Date.now(),
    } as unknown as ExcalidrawElement;

    elements = [frame, ...elements];
  } else {
    elements = elements.map((el) => {
      if (el.id === FRAME_ID) {
        return {
          ...(el as any),
          width: FRAME_W,
          height: FRAME_H,
          locked: true,
          strokeColor: "#e5e7eb",
        } as ExcalidrawElement;
      }
      return el;
    });
  }

  return {
    elements,
    appState: {
      ...(page.sceneData?.appState || {}),
      collaborators: new Map(),
      viewBackgroundColor: "#fafafa",
      scrollX: 0,
      scrollY: 0,
    },
    files: mapAssetsToExcalidrawFiles(page.assets || {}),
  };
}



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


export type ExtractedPageData = {
  sceneData: ExcalidrawSceneData;
  assets: Record<string, AssetRef>;
};

// 保存用: Excalidraw BinaryFiles -> AssetRef
export const extractPageDataFromExcalidraw = (
  elements: readonly ExcalidrawElement[],
  appState: any,
  files: BinaryFiles
): ExtractedPageData => {
  
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
      elements: [...elements],
      appState,
    },
    assets,
  };
};
