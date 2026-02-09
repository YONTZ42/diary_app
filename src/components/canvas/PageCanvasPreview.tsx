"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { Grid3X3 } from "lucide-react";
import { Page } from "@/types/schema";
import { mapAssetsToExcalidrawFiles } from "@/utils/excalidrawMapper";

// --- Excalidraw Dynamic Import ---
// SSRなしで読み込む
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false }
);

// --- Constants ---
const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;

// データを整形する関数
function prepareExcalidrawData(page: Page) {
  const rawElements = page.sceneData?.elements || [];
  
  // フレームがあるか確認、なければ追加
  let elements = rawElements;
  const hasFrame = elements.find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  
  if (!hasFrame) {
    const frame = {
      type: "rectangle",
      id: FRAME_ID,
      x: 0, y: 0, width: FRAME_W, height: FRAME_H,
      angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent",
      fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
      roughness: 0, opacity: 100, locked: true,
      version: 1, isDeleted: false,
    };
    elements = [frame, ...elements];
  } else {
    // 既存フレームのスタイルを強制
    elements = elements.map((el: any) => {
        if (el.id === FRAME_ID) {
            return { ...el, width: FRAME_W, height: FRAME_H, locked: true, strokeColor: "#e5e7eb" };
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
      scrollX: 0, scrollY: 0, zoom: { value: 0.5 } // 初期ズームを仮設定
    },
    files: mapAssetsToExcalidrawFiles(page.assets || {}),
  };
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
  const [api, setApi] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridOn, setGridOn] = useState(false);

  // 日付表示用
  const dateObj = new Date(page.date);
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = dateObj.getDate().toString().padStart(2, "0");

  // 初期データ生成 (useMemoでキャッシュ)
  const initialData = useMemo(() => prepareExcalidrawData(page), [page]);
  
  // 再描画用キー (更新日時が変われば再マウント)
  const renderKey = page.updatedAt || page.id;

  // 自動フィット処理
  useEffect(() => {
    if (!api || !initialData.elements) return;

    // 少し遅延させて確実にレンダリング後にフィットさせる
    const timer = setTimeout(() => {
        const frame = initialData.elements.find((el: any) => el.id === FRAME_ID);
        const target = frame ? [frame] : initialData.elements;
        
        if (target.length > 0) {
            api.scrollToContent(target, { 
                fitToContent: true,
                animate: false 
            });
        }
    }, 100);

    return () => clearTimeout(timer);
  }, [api, initialData]);

    const stickerCount = page.usedStickerIds?.length || 0;

  return (
    <div
      className={clsx(
        "relative bg-white shadow-xl flex flex-col overflow-hidden rounded-xl isolate border border-gray-100",
        className || "h-full w-full"
      )}
    >
      {/* 1. Header Overlay (日付など) */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col items-center bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-sm border border-gray-100">
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

      {/* 2. Canvas Area (Excalidraw) */}
      {/* ここで高さをパーセントで明示的に確保 (70%) */}
      <div
        ref={containerRef}
        onClick={(e) => {
          e.stopPropagation();
          onEditCanvas?.();
        }}
        className="relative w-full h-[70%] bg-[#fafafa] border-b border-gray-100 cursor-pointer group/canvas overflow-hidden"
      >
        {/* Grid Toggle Button */}
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

        {/* Excalidraw Wrapper */}
        {/* absolute inset-0 で親(h-[70%])いっぱいに広げる */}
        <div className="absolute inset-0 w-full h-full">
            {/* ポインターイベントを無効化して「見るだけ」にするが、レンダリング自体は阻害しない */}
            <div className="w-full h-full pointer-events-none exca-preview">
                <Excalidraw
                    key={renderKey}
                    initialData={initialData}
                    excalidrawAPI={(apiObj: any) => setApi(apiObj)}
                    viewModeEnabled={true}
                    zenModeEnabled={true}
                    gridModeEnabled={gridOn}
                    theme="light"
                    name="preview-canvas"
                    UIOptions={{
                        canvasActions: {
                            loadScene: false, saveToActiveFile: false, export: false,
                            saveAsImage: false, clearCanvas: false, toggleTheme: false,
                            changeViewBackgroundColor: false,
                        },
                    }}
                    
                />
            </div>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover/canvas:bg-black/5 z-20 transition-colors pointer-events-none" />
      </div>

      {/* 3. Text Area (残り30%) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onEditHeader?.();
        }}
        className="relative w-full h-[30%] p-5 bg-white z-20 flex flex-col justify-center cursor-pointer hover:bg-gray-50 transition-colors group/text"
      >
        <div
          className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full transition-transform duration-300 group-hover/text:scale-y-110 bg-blue-500"
        />
        <div className="pl-4 h-full overflow-hidden">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-2 leading-tight truncate">
            {page.title || "No Title"}
          </h2>
          <p className="font-sans text-xs leading-relaxed text-gray-500 line-clamp-3 whitespace-pre-wrap">
            {page.note || "Tap here to write something..."}
          </p>
        </div>
        
        {stickerCount > 0 && (
          <div className="absolute bottom-3 right-3">
             <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">
               ★ {stickerCount} stickers
             </span>

          </div>
        )}
      </div>
    </div>
  );
};