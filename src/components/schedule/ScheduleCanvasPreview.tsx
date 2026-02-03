"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Page } from "@/types/schema";
import { mapAssetsToExcalidrawFiles } from "@/utils/excalidrawMapper";

// Excalidraw Dynamic Import
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false }
);

interface ScheduleCanvasPreviewProps {
  page: Page;
  onClick?: () => void;
}

export const ScheduleCanvasPreview: React.FC<ScheduleCanvasPreviewProps> = ({ page, onClick }) => {
  const [api, setApi] = useState<any>(null);

  // データ準備
  const initialData = useMemo(() => {
    return {
      elements: page.sceneData?.elements || [],
      appState: {
        ...page.sceneData?.appState,
        viewBackgroundColor: "#ffffff", // 手帳なので白背景固定
        scrollX: 0, scrollY: 0, zoom: { value: 0.6 } // 初期ズーム調整
      },
      files: mapAssetsToExcalidrawFiles(page.assets),
    };
  }, [page]);

  const renderKey = page.updatedAt || page.id;

  // 自動フィット
  useEffect(() => {
    if (!api || !initialData.elements.length) return;
    const timer = setTimeout(() => {
      api.scrollToContent(initialData.elements, { 
         fitToContent: true,
         animate: false 
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [api, initialData]);

  return (
    <div 
      className="w-full h-full relative cursor-pointer group bg-white shadow-sm overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 pointer-events-none">
        <Excalidraw
          key={renderKey}
          initialData={initialData as any}
          excalidrawAPI={(apiObj: any) => setApi(apiObj)}
          viewModeEnabled={true}
          zenModeEnabled={true}
          gridModeEnabled={false}
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false, saveToActiveFile: false, export: false,
              saveAsImage: false, clearCanvas: false, toggleTheme: false,
              changeViewBackgroundColor: false,
            },
          }}
        />
      </div>

      {/* Hover Overlay Text */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 z-10">
        <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md border border-gray-200">
           Tap to Edit
        </span>
      </div>
    </div>
  );
};