"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { Grid3X3 } from "lucide-react";
import { Page } from "../types/schema";
import { mapAssetsToExcalidrawFiles } from "../utils/excalidrawMapper";

// --- Excalidraw Dynamic Import ---
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-stone-50 animate-pulse" />,
  }
);

// --- Constants & Helpers ---
const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;

function ensureFrame(elements: readonly any[]) {
  const found = elements.find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  if (found) {
    const patched = elements.map((el: any) => {
      if (el?.id !== FRAME_ID) return el;
      return {
        ...el,
        locked: true,
        isDeleted: false,
        width: FRAME_W,
        height: FRAME_H,
        backgroundColor: "transparent",
        strokeColor: "#e5e7eb",
        strokeWidth: 2,
        strokeStyle: "solid",
      };
    });
    return { elements: patched, frame: found };
  }
  const frame = {
    type: "rectangle",
    id: FRAME_ID,
    x: 0, y: 0, width: FRAME_W, height: FRAME_H,
    angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent",
    fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
    roughness: 0, opacity: 100, locked: true,
    version: 1, isDeleted: false,
  };
  return { elements: [frame, ...elements], frame };
}

function fitToFrame(api: any, elements: readonly any[]) {
  if (!api) return;
  const frame = elements.find((el: any) => el?.id === FRAME_ID);
  const target = frame ? [frame] : api.getSceneElements?.() ?? undefined;
  
  requestAnimationFrame(() => {
    if (target) api.scrollToContent(target, { fitToContent: true });
  });
}

interface PageCanvasPreviewProps {
  page: Page;
  onEditHeader?: () => void;
  onEditCanvas?: () => void;
  className?: string;
}

export const PageCanvasPreview: React.FC<PageCanvasPreviewProps> = ({
  page,
  onEditHeader,
  onEditCanvas,
  className
}) => {
  const [gridOn, setGridOn] = useState(false);
  const [api, setApi] = useState<any>(null);

  // 日付フォーマット
  const dateObj = new Date(page.date);
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = dateObj.getDate().toString().padStart(2, "0");

  const accentColor = "#3b82f6"; 

  // Excalidraw初期データ構築
  // page.updatedAt が変わると useMemo も再計算される
  const initialData = useMemo(() => {
    const rawElements = page.sceneData?.elements || [];
    const withFrame = ensureFrame(rawElements);
    
    return {
      elements: withFrame.elements,
      appState: {
        ...page.sceneData?.appState,
        viewBackgroundColor: "#fafafa",
        collaborators: new Map(),
        scrollX: 0, scrollY: 0,
      },
      // ★重要: 画像ファイルのマッピングを確実に渡す
      files: mapAssetsToExcalidrawFiles(page.assets),
    };
  }, [page]); // pageオブジェクト自体、または page.updatedAt への依存

  // マウント時フィット
  useEffect(() => {
    if (api && initialData.elements.length > 0) {
      fitToFrame(api, initialData.elements);
    }
  }, [api, initialData]);

  // ★重要: 再レンダリング用のキーを作成
  // page.updatedAt があればそれを、なければランダム(またはID)を使う
  const renderKey = page.updatedAt || page.id;

  return (
    <div
      className={clsx(
        "relative bg-white shadow-xl flex flex-col overflow-hidden rounded-xl isolate transition-all duration-300 border border-gray-100",
        className || "h-full w-full"
      )}
    >
      {/* 1. Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col items-center bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-sm border border-white/50">
          <span className="text-[10px] font-mono font-bold text-gray-400 leading-none mb-1">
            {year}
          </span>
          <span className="text-3xl font-serif leading-none font-bold text-gray-800">
            {day}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mt-1 border-t border-gray-200 pt-1 w-full text-center">
            {month}
          </span>
        </div>
      </div>

      {/* 2. Canvas Area */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onEditCanvas?.();
        }}
        className="h-[70%] min-h-[70%] w-full bg-[#fafafa] relative overflow-hidden z-10 border-b border-gray-100 cursor-pointer group/canvas"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setGridOn((v) => !v);
          }}
          className="absolute right-3 bottom-3 z-[40] bg-white/90 backdrop-blur border border-gray-200 shadow-sm rounded-full px-3 py-2 flex items-center gap-2 active:scale-95 transition opacity-0 group-hover/canvas:opacity-100"
        >
          <Grid3X3 size={14} className="text-gray-600" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">GRID</span>
        </button>

        <div className="absolute inset-0 bg-black/0 group-hover/canvas:bg-black/5 z-20 transition-colors pointer-events-none" />

        <div className="w-full h-full relative">
          {/* 
            ★ここが重要: key={renderKey} を指定することで、
            pageデータが更新された（updatedAtが変わった）タイミングで
            Excalidrawコンポーネントを破棄→再生成し、最新のinitialDataを読み込ませる
          */}
          <Excalidraw
            key={renderKey} 
            initialData={initialData as any}
            excalidrawAPI={(apiObj: any) => setApi(apiObj)}
            viewModeEnabled={true}
            zenModeEnabled={true}
            gridModeEnabled={gridOn}
            theme="light"
            UIOptions={{
              canvasActions: {
                loadScene: false, saveToActiveFile: false, export: false,
                saveAsImage: false, clearCanvas: false, toggleTheme: false,
                changeViewBackgroundColor: false,
              },
            }}
          />
          <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
      </div>

      {/* 3. Text Area */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onEditHeader?.();
        }}
        className="h-[30%] min-h-[30%] p-5 relative bg-white z-20 flex flex-col justify-center cursor-pointer hover:bg-gray-50 transition-colors group/text"
      >
        <div
          className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full transition-transform duration-300 group-hover/text:scale-y-110"
          style={{ backgroundColor: accentColor }}
        />
        <div className="pl-4 overflow-hidden">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-2 leading-tight truncate">
            {page.title || "No Title"}
          </h2>
          <p className="font-sans text-xs leading-relaxed text-gray-500 line-clamp-3 whitespace-pre-wrap">
            {page.note || "Tap to write something..."}
          </p>
        </div>
        
        {page.usedStickerIds.length > 0 && (
          <div className="absolute bottom-3 right-3">
             <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">
               ★ {page.usedStickerIds.length} stickers
             </span>
          </div>
        )}
      </div>
    </div>
  );
};