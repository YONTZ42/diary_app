"use client";

import React, { useState, useMemo } from 'react';
import { Page } from '../types/schema';
// パスは実際のプロジェクト構成に合わせて調整してください
import { Calendar } from '../_components/calendar'; 
import { PageCanvasPreview } from '../components/PageCanvasPreview';
import { motion, AnimatePresence } from 'framer-motion';

// 画像URL取得用の簡易ヘルパー
const getImageUrl = (asset?: { key: string }) => asset?.key || "https://placehold.co/400x400/png?text=No+Image";

interface CalendarViewProps {
  pages: Page[];
  // 編集リクエスト用コールバック
  onEditRequest: (page: Page, target: 'meta' | 'canvas') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ pages, onEditRequest }) => {
  const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());
  const [focusedPageId, setFocusedPageId] = useState<string | null>(null);

  // カレンダーヘッダー用の年月表示
  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, []);
  
  // PageデータをCalendarコンポーネント用データ(Article)に変換
  const articles = useMemo(() => {
    return pages.map(page => {
      // YYYY-MM-DD から「日」の数値を取り出す
      const dayPart = page.date.split('-')[2];
      const day = parseInt(dayPart, 10);

      return {
        id: page.id,
        date: isNaN(day) ? 1 : day,
        imageUrl: getImageUrl(page.preview),
        issueId: undefined
      };
    });
  }, [pages]);

  // フォーカス中のページデータを取得
  const focusedPage = useMemo(() => 
    pages.find(p => p.id === focusedPageId), 
  [pages, focusedPageId]);

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto pt-4 relative">
      
      {/* Calendarコンポーネント(Gooey Effect)用 SVGフィルター定義 */}
      <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ヘッダーエリア */}
      <div className="px-6 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-white text-3xl font-black tracking-tighter">{currentMonthLabel}</h2>
          <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">Monthly Log</p>
        </div>
      </div>

      {/* カレンダー本体 */}
      <Calendar
        articles={articles}
        activeIssueId={null}
        selectedDraftIds={selectedDraftIds}
        focusedArticleId={focusedPageId}
        onFocusArticle={(id) => setFocusedPageId(id)}
        onUpdateDraftSelection={setSelectedDraftIds}
      />

      {/* 詳細プレビューモーダル */}
      <AnimatePresence>
        {focusedPage && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // 下からスライドインするシート状のモーダル
            className="absolute inset-0 z-50 bg-white flex flex-col shadow-2xl rounded-t-3xl overflow-hidden mt-12" 
          >
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white shrink-0">
              <span className="font-bold text-gray-800 text-lg ml-2">
                {focusedPage.date}
              </span>
              <button 
                onClick={() => setFocusedPageId(null)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {/* プレビュー表示エリア */}
            <div className="flex-1 overflow-hidden bg-gray-50 p-4">
              <div className="h-full w-full shadow-sm rounded-2xl overflow-hidden bg-white border border-gray-200">
                <PageCanvasPreview 
                  page={focusedPage}
                  // 親(PagesScreen)へ編集リクエストを通知
                  onEditHeader={() => onEditRequest(focusedPage, 'meta')}
                  onEditCanvas={() => onEditRequest(focusedPage, 'canvas')}
                />
              </div>
            </div>
            
            {/* ガイド */}
            <div className="pb-6 pt-2 text-center bg-white border-t border-gray-50">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tap to edit</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};