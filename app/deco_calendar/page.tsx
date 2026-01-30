// app/pages/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { DiaryView } from '../components/DiaryView';
import { CalendarView } from '../components/CalendarView';
import { ScheduleView } from '../components/ScheduleView';
import { PageCanvasEditor } from '../components/PageCanvasEditor'; // エディタをここでインポート
import { MOCK_PAGES } from '../utils/dummyData';
import { Page } from '../types/schema';

// 1. 作成したフックをインポート
import { usePersistentPages } from '../hooks/usePersistentPages';

type Tab = 'diary' | 'calendar' | 'schedule';

export default function PagesScreen() {
  const [currentTab, setCurrentTab] = useState<Tab>('diary');
  
  // 2. フックを使って永続化されたページ状態を取得
  const { pages, updatePages, isLoaded } = usePersistentPages();

  const [editingState, setEditingState] = useState<{
    pageId: string;
    target: 'meta' | 'canvas';
  } | null>(null);

  const targetPage = editingState 
    ? pages.find(p => p.id === editingState.pageId) 
    : null;

  const handleEditRequest = (page: Page, target: 'meta' | 'canvas') => {
    setEditingState({ pageId: page.id, target });
  };

  // 3. 保存ハンドラを修正 (localStorageへの保存を含む updatePages を呼ぶ)
  const handleSave = (updatedFields: Partial<Page>) => {
    if (!editingState) return;

    const newPages = pages.map((p) => {
      if (p.id === editingState.pageId) {
        return { 
          ...p, 
          ...updatedFields, 
          updatedAt: new Date().toISOString() 
        };
      }
      return p;
    });

    updatePages(newPages); // React状態更新 + localStorage保存
    setEditingState(null);
  };

  // ロード中は簡易ローディング表示（ちらつき防止）
  if (!isLoaded) {
    return <div className="h-screen w-full bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <div className="  pt-12 pb-2 px-4 bg-white z-20 shadow-sm shrink-0">
        <h1 className="text-2xl font-black text-gray-800 mb-4 tracking-tight">Pages</h1>
        
        <div className="flex p-1 bg-gray-100 rounded-xl">
          {(['diary', 'calendar', 'schedule'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`
                flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200
                ${currentTab === tab 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-300 ${currentTab === 'diary' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <DiaryView 
            pages={pages} 
            onEditRequest={handleEditRequest} 
          />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-300 ${currentTab === 'calendar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <CalendarView 
             pages={pages} 
             onEditRequest={handleEditRequest}
           />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-300 ${currentTab === 'schedule' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {currentTab === 'schedule' && <ScheduleView />}
        </div>
      </div>

      <div className="h-20 border-t border-gray-100 bg-white shrink-0 flex items-center justify-center text-gray-300 text-xs z-20">
        Bottom Navigation Area
      </div>

      {targetPage && editingState && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-10 duration-200">
          <PageCanvasEditor
            initialPage={targetPage}
            focusTarget={editingState.target}
            onSave={handleSave}
            onClose={() => setEditingState(null)}
          />
        </div>
      )}
    </div>
  );
}