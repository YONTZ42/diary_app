"use client";

import React from 'react';
import { Page } from '../types/schema';
import { PageCanvasPreview } from './PageCanvasPreview';

interface DiaryViewProps {
  pages: Page[];
  // 変更点: 親コンポーネントに編集リクエストを送るコールバックを追加
  onEditRequest: (page: Page, target: 'meta' | 'canvas') => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({ pages, onEditRequest }) => {
  const sortedPages = [...pages].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="w-full h-full bg-gray-100 overflow-y-hidden">
      <div className="flex flex-row h-full overflow-x-auto snap-x snap-mandatory pb-4 px-4 gap-4 items-center">
        {sortedPages.map((page) => (
          <div 
            key={page.id} 
            className="snap-center shrink-0 w-[85vw] h-[90%] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-transform active:scale-[0.99]"
          >
            <PageCanvasPreview 
              page={page}
              // ここで親の関数を呼ぶ
              onEditHeader={() => onEditRequest(page, 'meta')}
              onEditCanvas={() => onEditRequest(page, 'canvas')}
            />
          </div>
        ))}
        <div className="shrink-0 w-4" />
      </div>
    </div>
  );
};