"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Page } from "@/types/schema";
import { mapAssetsToExcalidrawFiles } from "@/utils/excalidrawMapper";

// ローディング中は何も表示しない（ちらつき防止）
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <div className="w-full h-full bg-white" /> }
);

interface ScheduleCanvasPreviewProps {
  page: Page;
  onClick?: () => void;
}

const ScheduleCanvasPreviewBase: React.FC<ScheduleCanvasPreviewProps> = ({ page, onClick }) => {
  const [api, setApi] = useState<any>(null);
  const [isReady, setIsReady] = useState(false); // 描画準備完了フラグ

  const initialData = useMemo(() => {
    return {
      elements: page.sceneData?.elements || [],
      appState: {
        ...page.sceneData?.appState,
        viewBackgroundColor: "#ffffff",
        scrollX: 0, scrollY: 0, 
        // 初期ズームを小さめにしておく（大きすぎてはみ出るのを防ぐ）
        zoom: { value: 0.1 } 
      },
      files: mapAssetsToExcalidrawFiles(page.assets),
    };
  }, [page]);

  const renderKey = `${page.id}-${page.updatedAt}`;

  useEffect(() => {
    if (!api || !initialData.elements.length) return;

    // 描画が安定するまで少し待つ
    const timer = setTimeout(() => {
      api.scrollToContent(initialData.elements, { 
         fitToContent: true,
         animate: false 
      });
      // ズームフィット完了後に表示フラグを立てる
      requestAnimationFrame(() => setIsReady(true));
    }, 100);

    return () => clearTimeout(timer);
  }, [api, initialData]);

  return (
    <div 
      className="w-full h-full relative cursor-pointer group bg-white shadow-sm overflow-hidden rounded-lg isolate"
      onClick={onClick}
    >
      {/* 
        Excalidraw Container 
        isReadyがfalseの間は opacity-0 で隠しておくことで、
        「初期化中の一瞬大きな表示」や「リサイズ中のガタつき」をユーザーに見せない
      */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* pointer-events-none で操作無効化 */}
        <div className="w-full h-full pointer-events-none">
          <Excalidraw
            key={renderKey}
            initialData={initialData as any}
            excalidrawAPI={(apiObj: any) => setApi(apiObj)}
            viewModeEnabled={true}
            zenModeEnabled={true}
            gridModeEnabled={false}
            theme="light"
            name="schedule-preview"
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

      {/* Loading Placeholder (isReadyになるまで表示) */}
      {!isReady && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
           {/* 必要ならスピナーなどを入れるが、白背景だけでもOK */}
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 z-20">
        <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md border border-gray-200">
           Tap to Edit
        </span>
      </div>
    </div>
  );
};

// React.memoで再レンダリング抑制
export const ScheduleCanvasPreview = React.memo(ScheduleCanvasPreviewBase, (prev, next) => {
  return prev.page.id === next.page.id && prev.page.updatedAt === next.page.updatedAt;
});