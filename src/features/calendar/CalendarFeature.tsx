"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarDayPreviewArea } from '@/components/calendar/CalendarDayPreviewArea';
import { MOCK_CALENDAR_PAGES } from '@/utils/dummyCalendar';
import { Page } from '@/types/schema';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';
import { fetchPages, fetchPagesByDate, createPage, updatePage} from '@/services/api';


export const CalendarFeature = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDatePages, setSelectedDatePages] = useState<Page[]>([]);
  const [editorPage, setEditorPage] = useState<Page | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

const handleDayClick = async (day: number) => { // 1. asyncを付ける
  const targetDate = new Date(year, month-1, day);
  setSelectedDate(targetDate);


  try {
    // 2. await でデータの取得を待つ
    const pages = await fetchPagesByDate({ year, month, day });
    
    console.log("Pages for selected date:", pages);
    
    // 3. 取得したデータをステートに格納
    setSelectedDatePages(Array.isArray(pages) ? pages : []);
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    setSelectedDatePages([]); // エラー時は空にする
  }
};

  const handleCreateNew = () => {
    if (!selectedDate) return;
    const selectedyear = selectedDate.getFullYear();
    const selectedmonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const selectedday = selectedDate.getDate().toString().padStart(2, "0");
    const dateStr = `${selectedyear}-${selectedmonth}-${selectedday}`;
    const newPage: Page = {
      owner: "default-user", // 仮の所有者ID
      // 一時IDであることを明確にする（保存ロジックで判定するため）
      id: `diary-${dateStr}-${Date.now()}`, 
      type: 'diary', 
      date: dateStr, 
      title: '', note: '',
      sceneData: { elements: [], appState: { viewBackgroundColor: "#fafafa" } }, 
      assets: {}, usedStickerIds: [], 
      preview: { kind: 'local', key: '', mime: '' },
      schemaVersion: 1, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    };
    setEditorPage(newPage);
  };


    const handleSave = async (updatedPage: Partial<Page>) => {
    if (!editorPage) return;

    try {
      let savedPage: Page;

      // IDが 'temp-' で始まるか、DBに存在しないと判断できる場合は新規作成
      // ここでは簡易的に editorPage.id が `diary-...` (一時ID) かどうかで判断
      if (editorPage.id.startsWith('diary-')) {
        // 新規作成 (NotebookIDは任意。カレンダーからの作成なので指定なしでもOKだが、
        // デフォルトNotebookがあるならそのIDを渡すのがベター)
        savedPage = await createPage(updatedPage);
      } else {
        // 更新
        savedPage = await updatePage(editorPage.id, updatedPage);
      }

      // UI更新: リストに追加または置換
      setSelectedDatePages(prev => {
        const exists = prev.find(p => p.id === savedPage.id);
        if (exists) {
          return prev.map(p => p.id === savedPage.id ? savedPage : p);
        } else {
          return [...prev, savedPage];
        }
      });

      setEditorPage(null); // エディタを閉じる
    } catch (error) {
      console.error("Failed to save page:", error);
    }
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
          <PageCanvasEditor initialPage={editorPage} onSave={handleSave} onClose={() => setEditorPage(null)} />
        </div>
      )}
    </div>
  );
};