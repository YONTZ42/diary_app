"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarDayPreviewArea } from '@/components/calendar/CalendarDayPreviewArea';
import { MOCK_CALENDAR_PAGES } from '@/utils/dummyCalendar';
import { Page } from '@/types/schema';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';

export const CalendarFeature = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDatePages, setSelectedDatePages] = useState<Page[]>([]);
  const [editorPage, setEditorPage] = useState<Page | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetDate = new Date(year, month - 1, day);
    const pages = MOCK_CALENDAR_PAGES.filter(p => p.date === dateStr);
    setSelectedDate(targetDate);
    setSelectedDatePages(pages);
  };

  const handleCreateNew = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const newPage: Page = {
      id: `diary-${dateStr}-${Date.now()}`, type: 'diary', date: dateStr, title: '', note: '',
      sceneData: {}, assets: {}, usedStickerIds: [], preview: { kind: 'local', key: '', mime: '' },
      schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setEditorPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] pb-32 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-gray-800 flex flex-col">
          <span>{year}</span><span className="text-blue-600">{currentDate.toLocaleString('en-US', { month: 'long' })}</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); setSelectedDate(null); }} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600"><ChevronLeft size={20} /></button>
          <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); setSelectedDate(null); }} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="w-full px-4">
        <CalendarGrid year={year} month={month} pages={MOCK_CALENDAR_PAGES} onDayClick={handleDayClick} />
      </div>

      {selectedDate && (
        <div className="w-full px-4">
          <CalendarDayPreviewArea
            date={selectedDate} pages={selectedDatePages} onClose={() => setSelectedDate(null)}
            onEditPage={setEditorPage} onCreateNew={handleCreateNew}
          />
        </div>
      )}

      {editorPage && (
        <div className="fixed inset-0 z-[100] bg-white">
          <PageCanvasEditor initialPage={editorPage} onSave={() => setEditorPage(null)} onClose={() => setEditorPage(null)} />
        </div>
      )}
    </div>
  );
};