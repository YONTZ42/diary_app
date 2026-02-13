"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Schedule } from "@/types/schema"; // Page -> Schedule
import { mapAssetsToExcalidrawFiles } from "@/utils/excalidrawMapper";

// ローディング中は白背景
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <div className="w-full h-full bg-white" /> }
);

interface ScheduleCanvasPreviewProps {
  schedule: Schedule; // props名を変更
  onClick?: () => void;
}

const ScheduleCanvasPreviewBase: React.FC<ScheduleCanvasPreviewProps> = ({ schedule, onClick }) => {
  const [api, setApi] = useState<any>(null);
  
  // 初期化フラグ (描画完了まで隠す)
  const [isReady, setIsReady] = useState(false);

  // 一意のキー (ID + 更新日時)
  const scheduleUniqueKey = `${schedule.id}-${schedule.updatedAt}`;

  // データ準備 (安全策を追加)
  const initialData = useMemo(() => {
    // sceneData.elements が配列でない場合は空配列にする
    const elements = Array.isArray(schedule.sceneData?.elements) 
      ? schedule.sceneData.elements 
      : [];
      
    return {
      elements,
      appState: {
        ...(schedule.sceneData?.appState || {}),
        viewBackgroundColor: "#ffffff",
        scrollX: 0, scrollY: 0,
        // collaboratorsがないとエラーになる場合があるので補完
        collaborators: new Map(), 
      },
      files: mapAssetsToExcalidrawFiles(schedule.assets || {}),
    };
  }, [schedule]);

  // IDが変わったら一旦隠す
  useEffect(() => {
    setIsReady(false);
  }, [scheduleUniqueKey]);

  useEffect(() => {
    if (!api || !initialData.elements.length) return;

    // 描画安定待ち
    const timer = setTimeout(() => {
      api.scrollToContent(initialData.elements, { 
         fitToContent: true,
         animate: false 
      });
      // 完了後に表示
      requestAnimationFrame(() => {
        setTimeout(() => setIsReady(true), 50);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [api, initialData, scheduleUniqueKey]);

  return (
    <div 
      className="w-full h-full relative cursor-pointer group bg-white shadow-sm overflow-hidden rounded-lg isolate"
      onClick={onClick}
    >
      {/* Excalidraw Container */}
      <div 
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
        style={{ opacity: isReady ? 1 : 0 }}
      >
        <div className="w-full h-full pointer-events-none exca-preview">
          <Excalidraw
            key={scheduleUniqueKey} // IDが変わったら再マウント
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

      {/* Loading Cover */}
      <div 
        className="absolute inset-0 bg-white z-10 transition-opacity duration-300"
        style={{ 
          opacity: isReady ? 0 : 1, 
          pointerEvents: isReady ? 'none' : 'auto' 
        }}
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 z-20">
        <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md border border-gray-200">
           Tap to Edit
        </span>
      </div>
    </div>
  );
};

export const ScheduleCanvasPreview = React.memo(ScheduleCanvasPreviewBase, (prev, next) => {
  return prev.schedule.id === next.schedule.id && prev.schedule.updatedAt === next.schedule.updatedAt;
});