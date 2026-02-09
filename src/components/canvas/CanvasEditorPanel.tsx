"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from "next/dynamic";
import { Check, Grid3X3, X } from 'lucide-react';
import { mapAssetsToExcalidrawFiles, extractPageDataFromExcalidraw } from '@/utils/excalidrawMapper';
import { useExcalidrawFiles } from '@/hooks/useExcalidrawFiles';

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-50" /> }
);

const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;

function ensureFrame(elements: readonly any[]) {
  const safeElements = Array.isArray(elements) ? [...elements] : [];
  const foundIndex = safeElements.findIndex((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  
  if (foundIndex !== -1) {
    safeElements[foundIndex] = {
      ...safeElements[foundIndex],
      locked: true,
      width: FRAME_W,
      height: FRAME_H,
      backgroundColor: "transparent",
      strokeColor: "#e5e7eb",
    };
  } else {
    safeElements.unshift({
      type: "rectangle", id: FRAME_ID, x: 0, y: 0, width: FRAME_W, height: FRAME_H,
      angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent", fillStyle: "solid",
      strokeWidth: 2, strokeStyle: "solid", roughness: 0, opacity: 100, locked: true,
      version: 1, isDeleted: false,
    });
  }
  return { 
    elements: safeElements, 
    frame: safeElements.find(el => el.id === FRAME_ID) 
  };
}

function fitToFrame(api: any, elements: readonly any[]) {
  if (!api) return;
  const frame = elements.find((el: any) => el?.id === FRAME_ID);
  const target = frame ? [frame] : elements;
  if (target.length > 0) {
    requestAnimationFrame(() => {
      api.scrollToContent(target, { fitToContent: true });
    });
  }
}

interface CanvasEditorPanelProps {
  initialSceneData: any;
  initialAssets: Record<string, any>;
  onSaveScene: (scene: any, assets: any) => void;
  onClose: () => void;
  title?: string;
}

export const CanvasEditorPanel: React.FC<CanvasEditorPanelProps> = ({ 
  initialSceneData, 
  initialAssets, 
  onSaveScene, 
  onClose,
  title = "Editing Canvas"
}) => {
  const [gridOn, setGridOn] = useState(true);
  const [api, setApi] = useState<any>(null);
  
  // S3アップロードフック
  const { handleFilesChange, isUploading, prepareFilesForSave } = useExcalidrawFiles();
  
  const initialData = useMemo(() => {
    const rawElements = initialSceneData?.elements || [];
    const withFrame = ensureFrame(rawElements);
    return {
      elements: withFrame.elements,
      appState: { 
        ...initialSceneData?.appState, 
        viewBackgroundColor: "#fafafa", 
        collaborators: new Map(),
        errorMessage: null 
      },
      files: mapAssetsToExcalidrawFiles(initialAssets || {}),
    };
  }, [initialSceneData, initialAssets]);

  const draftRef = useRef<any>(initialData);

  useEffect(() => {
    if (api) fitToFrame(api, initialData.elements);
  }, [api, initialData]);

  const handleDone = async () => {
    if (!api) { onClose(); return; }
    
    // アップロード中は待機させる（簡易実装）
    if (isUploading) {
      alert("Images are still uploading. Please wait...");
      return;
    }

    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();
    
    // 保存用にファイルを加工（S3 URLへの差し替え）
    const savedFiles = await prepareFilesForSave(files);
    
    // データ抽出とフレーム保証（assetsのクリーンアップも含む）
    const extracted = extractPageDataFromExcalidraw(elements, appState, savedFiles);
    const ensured = ensureFrame(extracted.sceneData.elements ?? []);
    
    onSaveScene(
      { 
        elements: ensured.elements, 
        appState: { 
          viewBackgroundColor: extracted.sceneData.appState?.viewBackgroundColor, 
          collaborators: new Map() 
        } 
      },
      extracted.assets
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9F8F6] flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={20} /></button>
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
        </div>
        <div className="flex items-center gap-3">
           {isUploading && <span className="text-xs text-blue-500 animate-pulse mr-2">Uploading...</span>}
           <button type="button" onClick={() => setGridOn(v => !v)} className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${gridOn ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
             <Grid3X3 size={14} /><span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Grid</span>
           </button>
           <button onClick={handleDone} disabled={isUploading} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full active:scale-95 transition-all shadow-md hover:bg-slate-800 disabled:opacity-50">
             <span className="text-[10px] font-bold uppercase tracking-widest">Done</span><Check size={16} />
           </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full overflow-hidden p-4">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm relative">
          <Excalidraw
            initialData={initialData as any}
            excalidrawAPI={(apiObj: any) => setApi(apiObj)}
            theme="light"
            gridModeEnabled={gridOn}
            viewModeEnabled={false}
            zenModeEnabled={false}
            onChange={(elements: any, appState: any, files: any) => {
              handleFilesChange(files); // 自動アップロード
              draftRef.current = { elements, appState, files };
            }}
            UIOptions={{
              canvasActions: {
                toggleTheme: false, changeViewBackgroundColor: true, clearCanvas: true,
                export: false, saveAsImage: false, loadScene: false,
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};