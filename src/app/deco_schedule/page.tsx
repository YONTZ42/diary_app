"use client";

import React, { useState, useEffect } from 'react';
import { ScheduleNavigator, ViewMode } from '@/components/schedule/ScheduleNavigator';
import { ScheduleCanvasPreview } from '@/components/schedule/ScheduleCanvasPreview'; // 変更
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';
import { generateMonthTemplate, generateWeekTemplate } from '@/utils/scheduleTemplates';
import { Page } from '@/types/schema';

// MOCK_DB (簡易メモリDB)
const MOCK_DB: Record<string, Page> = {};

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  // ID生成
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

  // データ取得・生成
  useEffect(() => {
    const pageId = getPageId(currentDate, viewMode);
    
    if (MOCK_DB[pageId]) {
      setCurrentPage(MOCK_DB[pageId]);
    } else {
      // テンプレート生成
      const elements = viewMode === 'month' 
        ? generateMonthTemplate(currentDate.getFullYear(), currentDate.getMonth() + 1)
        : generateWeekTemplate(currentDate);

      const newPage: Page = {
        id: pageId,
        type: 'schedule',
        date: pageId,
        title: viewMode === 'month' ? 'Monthly' : 'Weekly',
        sceneData: {
           elements,
           appState: { viewBackgroundColor: "#ffffff" }
        },
        assets: {},
        usedStickerIds: [],
        preview: { kind: 'local', key: '', mime: 'image/png' },
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentPage(newPage);
    }
  }, [currentDate, viewMode]);

  // ナビゲーション
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
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
    <main className="h-screen flex flex-col bg-[#F2F0E9] overflow-hidden">
      {/* 1. Header Navigation */}
      <ScheduleNavigator
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewChange={setViewMode}
        onToday={() => setCurrentDate(new Date())}
      />

      {/* 2. Main Canvas Area (Full Size) */}
      <div className="flex-1 w-full h-full relative p-4 md:p-6 overflow-hidden flex justify-center bg-[#F2F0E9]">
        {currentPage && (
           // 手帳の紙面のようなコンテナ
           <div className="w-full max-w-[1000px] h-full shadow-xl bg-white rounded-lg overflow-hidden border border-gray-200">
             <ScheduleCanvasPreview
               page={currentPage}
               onClick={() => setIsEditing(true)}
             />
           </div>
        )}
      </div>

      {/* 3. Simple Footer (Spacer for bottom nav if needed) */}
      <div className="h-16 shrink-0" />

      {/* Editor Modal */}
      {isEditing && currentPage && (
        <div className="fixed inset-0 z-50 bg-white">
          <PageCanvasEditor
            initialPage={currentPage}
            onSave={handleSave}
            onClose={() => setIsEditing(false)}
            focusTarget="canvas"
          />
        </div>
      )}
    </main>
  );
}