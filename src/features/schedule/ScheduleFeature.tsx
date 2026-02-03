"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { ScheduleNavigator, ViewMode } from '@/components/schedule/ScheduleNavigator';
import { ScheduleCanvasPreview } from '@/components/schedule/ScheduleCanvasPreview';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';
import { generateMonthTemplate, generateWeekTemplate } from '@/utils/scheduleTemplates';
import { Page } from '@/types/schema';

// 簡易DB (データ保持用)
const MOCK_DB: Record<string, Page> = {};

export const ScheduleFeature = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEditing, setIsEditing] = useState(false);
  
  // 表示用ページデータ
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  
  // トランジション用フック
  const [isPending, startTransition] = useTransition();

  const getPageId = (date: Date, mode: ViewMode) => {
    if (mode === 'month') {
      return `month-${date.getFullYear()}-${date.getMonth() + 1}`;
    } else {
      const day = date.getDay();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - day);
      return `week-${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;
    }
  };

  // ページデータのロード処理
  const loadPageData = (date: Date, mode: ViewMode) => {
    const pageId = getPageId(date, mode);
    
    if (MOCK_DB[pageId]) {
      return MOCK_DB[pageId];
    } else {
      // テンプレート生成（少し重い処理）
      const elements = mode === 'month' 
        ? generateMonthTemplate(date.getFullYear(), date.getMonth() + 1)
        : generateWeekTemplate(date);

      const newPage: Page = {
        id: pageId, type: 'schedule', date: pageId, title: mode === 'month' ? 'Monthly' : 'Weekly',
        sceneData: { elements, appState: { viewBackgroundColor: "#ffffff" } },
        assets: {}, usedStickerIds: [], preview: { kind: 'local', key: '', mime: 'image/png' },
        schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      return newPage;
    }
  };

  // 初期ロード
  useEffect(() => {
    const page = loadPageData(currentDate, viewMode);
    setCurrentPage(page);
  }, []); // 初回のみ

  // ナビゲーションハンドラ (useTransitionでラップ)
  const handleNavigate = (action: 'prev' | 'next' | 'today' | 'mode', payload?: any) => {
    startTransition(() => {
      let nextDate = new Date(currentDate);
      let nextMode = viewMode;

      if (action === 'prev') {
        if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() - 1);
        else nextDate.setDate(nextDate.getDate() - 7);
      } else if (action === 'next') {
        if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
        else nextDate.setDate(nextDate.getDate() + 7);
      } else if (action === 'today') {
        nextDate = new Date();
      } else if (action === 'mode') {
        nextMode = payload as ViewMode;
      }

      // 1. 日付/モード更新
      setCurrentDate(nextDate);
      setViewMode(nextMode);

      // 2. ページデータ即時生成＆セット (useEffectを待たずに行うことでチラつき防止)
      const nextPage = loadPageData(nextDate, nextMode);
      setCurrentPage(nextPage);
    });
  };

  const handleSave = (updated: Partial<Page>) => {
    if (!currentPage) return;
    const pageId = getPageId(currentDate, viewMode);
    const savedPage = { ...currentPage, ...updated, updatedAt: new Date().toISOString() };
    MOCK_DB[pageId] = savedPage;
    setCurrentPage(savedPage);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F2F0E9] pb-32">
      <ScheduleNavigator
        currentDate={currentDate} 
        viewMode={viewMode}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onViewChange={(m) => handleNavigate('mode', m)} 
        onToday={() => handleNavigate('today')}
        isLoading={isPending} // ローディング状態を渡す
      />

      <div className="flex-1 w-full relative p-4 md:p-6 overflow-hidden flex justify-center">
        {/* コンテンツエリア */}
        <div 
          className={`w-full max-w-[1000px] h-full shadow-xl bg-white rounded-lg overflow-hidden border border-gray-200 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          {currentPage && (
             // keyにpageIdを指定することで、ページが変わったら明示的に作り直させる
             // (ただしScheduleCanvasPreview側でフェードイン処理があるのでスムーズに見える)
             <ScheduleCanvasPreview 
               key={currentPage.id} 
               page={currentPage} 
               onClick={() => setIsEditing(true)} 
             />
          )}
        </div>
      </div>

      {isEditing && currentPage && (
        <div className="fixed inset-0 z-[100] bg-white">
          <PageCanvasEditor
            initialPage={currentPage} 
            onSave={handleSave} 
            onClose={() => setIsEditing(false)} 
            focusTarget="canvas"
          />
        </div>
      )}
    </div>
  );
};