// components/pages/ScheduleView.tsx
import React from 'react';
import { Page } from '../types/schema';
import { PageCanvasEditor } from './PageCanvasEditor'; // 前回のコード

// スケジュール用の初期データ（グリッド線を引く）
// ※実際はExcalidrawElement[]の構造で線を定義しますが、ここでは簡略化しています
const mockScheduleSceneData = {
  elements: [
    // ここに罫線データのJSONが入る想定
    // { type: "line", x: 100, y: 0, points: [...] ... }
  ],
  appState: { viewBackgroundColor: "#f8f9fa" }
};

export const ScheduleView: React.FC = () => {
  // スケジュール用の仮ページデータ
  const schedulePage: Page = {
    id: 'schedule-weekly',
    schemaVersion: 1,
    type: 'schedule',
    date: new Date().toISOString().split('T')[0],
    title: 'Weekly Schedule',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sceneData: mockScheduleSceneData,
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'local', key: '', mime: 'image/png' } // dummy
  };

  const handleSave = (updated: Partial<Page>) => {
    console.log("Schedule saved:", updated);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* ScheduleView固有のヘッダー制御などがあればここに記述 */}
      <div className="flex-1">
        <PageCanvasEditor 
          initialPage={schedulePage} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
};