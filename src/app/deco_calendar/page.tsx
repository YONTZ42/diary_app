"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarDayPreviewArea } from '@/components/calendar/CalendarDayPreviewArea';
import { MOCK_CALENDAR_PAGES } from '@/utils/dummyCalendar';
import { Page } from '@/types/schema';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // その日のページリスト
  const [selectedDatePages, setSelectedDatePages] = useState<Page[]>([]);

  // 編集用
  const [editorPage, setEditorPage] = useState<Page | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 月移動
  const moveMonth = (diff: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + diff);
    setCurrentDate(newDate);
    setSelectedDate(null); // 月が変わったら選択解除
  };

  // セルクリック時の挙動
  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetDate = new Date(year, month - 1, day);
    
    // その日の全ページをフィルタリング
    const pages = MOCK_CALENDAR_PAGES.filter(p => p.date === dateStr);
    
    setSelectedDate(targetDate);
    setSelectedDatePages(pages);
  };

  // 新規作成
  const handleCreateNew = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const newPage: Page = {
      id: `diary-${dateStr}-${Date.now()}`,
      type: 'diary',
      date: dateStr,
      title: '',
      note: '',
      sceneData: {}, assets: {}, usedStickerIds: [],
      preview: { kind: 'local', key: '', mime: '' },
      schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setEditorPage(newPage);
  };

  return (
    <main className="min-h-screen bg-[#F2F0E9] pb-80 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-gray-800 flex flex-col">
          <span>{year}</span>
          <span className="text-blue-600">{currentDate.toLocaleString('en-US', { month: 'long' })}</span>
        </h1>

        <div className="flex gap-2">
          <button 
            onClick={() => moveMonth(-1)}
            className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => moveMonth(1)}
            className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
    <div className="w-full px-4">
      <CalendarGrid
        year={year}
        month={month}
        pages={MOCK_CALENDAR_PAGES}
        onDayClick={handleDayClick}
      />
    </div>


      {/* Bottom Preview Area (Overlay) */}
    {selectedDate && (
      <div className="w-full px-4"> {/* Padding用のラッパー */}
        <CalendarDayPreviewArea
          date={selectedDate}
          pages={selectedDatePages}
          onClose={() => setSelectedDate(null)}
          onEditPage={setEditorPage}
          onCreateNew={handleCreateNew}
        />
      </div>
    )}


      {/* Editor Modal (Full Screen) */}
      {editorPage && (
        <div className="fixed inset-0 z-50 bg-white">
          <PageCanvasEditor
            initialPage={editorPage}
            onSave={(updated) => {
              console.log('Saved:', updated);
              // 本来はここでDB更新＆リスト再取得
              setEditorPage(null);
            }}
            onClose={() => setEditorPage(null)}
          />
        </div>
      )}

    </main>
  );
}