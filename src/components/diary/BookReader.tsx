"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Grip, Maximize2, Edit2 } from 'lucide-react';
import { Page, Notebook } from '@/types/schema';
import { PageCanvasPreview } from '@/components/canvas/PageCanvasPreview';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';

interface BookReaderProps {
  notebook: Notebook;
  initialPages: Page[];
  onClose: () => void;
  onUpdatePage: (page: Page) => void;
  onCreatePage: (notebookId: string) => void;
    onDeletePage: (pageId: string) => void; // 追加

}

export const BookReader: React.FC<BookReaderProps> = ({
  notebook,
  initialPages,
  onClose,
  onUpdatePage,
  onCreatePage,
  onDeletePage,

}) => {
  // 表示モード: 'detail' (1ページ大きく) <-> 'grid' (小さく一覧)
  const [viewMode, setViewMode] = useState<'detail' | 'grid'>('detail');
  
  // 編集中のページID
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  
  // スクロールコンテナの参照
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ページ追加時の自動スクロール
  const prevPageCountRef = useRef(initialPages.length);
  useEffect(() => {
    if (initialPages.length > prevPageCountRef.current) {
      // 新しいページが追加されたら末尾へスクロール
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
    prevPageCountRef.current = initialPages.length;
  }, [initialPages.length]);

  // モード切り替え時のスタイル定義
  // detail: 画面幅いっぱい (w-screen), snap-center
  // grid:   画面幅の1/3くらい (w-40), snap-none (または緩いsnap)
  
  const getPageStyle = (mode: 'detail' | 'grid') => {
    if (mode === 'detail') {
      return "w-[90vw] md:w-[600px] h-[80vh] mx-2 snap-center shrink-0 transition-all duration-300";
    } else {
      return "w-[160px] h-[220px] mx-1 shrink-0 transition-all duration-300 hover:scale-105";
    }
  };

  // 編集モード
  const editingPage = initialPages.find(p => p.id === editingPageId);
  if (editingPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-white">
        <PageCanvasEditor
          initialPage={editingPage}
          onSave={(updated) => onUpdatePage({ ...editingPage, ...updated })}
          onDelete={(id) => {
             onDeletePage(id);
             setEditingPageId(null); // エディタを閉じる
          }}
          onClose={() => setEditingPageId(null)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F2F0E9]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-200 z-50 transition-all">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
          <X size={20} className="text-gray-600" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-serif font-bold text-gray-800">{notebook.title}</span>
          <span className="text-[10px] text-gray-500">{initialPages.length} Pages</span>
        </div>
        
        {/* View Toggle Button */}
        <button 
          onClick={() => setViewMode(prev => prev === 'detail' ? 'grid' : 'detail')}
          className="p-2 rounded-full hover:bg-black/5 text-gray-600"
        >
          {viewMode === 'detail' ? <Grip size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* 
         Main Scroll Area 
         ここが核心。CSS Scroll Snap を使ってネイティブのスクロール慣性を利用する。
         モードによってアイテムのサイズを変えるだけで、DOM構造は維持する。
      */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-x-auto overflow-y-hidden flex items-center py-8 px-[5vw] ${
          viewMode === 'detail' ? 'snap-x snap-mandatory' : 'flex-wrap content-start justify-center overflow-y-auto'
        }`}
      >
        <div className={`flex ${viewMode === 'grid' ? 'flex-wrap justify-center gap-4 w-full' : 'flex-nowrap'}`}>
          
          {initialPages.length > 0 ? (
            initialPages.map((page) => (
              <motion.div
                layout // サイズ変更時にアニメーション
                key={page.id}
                className={`relative bg-white shadow-md overflow-hidden border border-gray-200 cursor-pointer ${
                  viewMode === 'detail' 
                    ? 'w-[85vw] md:w-[500px] aspect-[3/4] rounded-lg mx-2 snap-center shadow-xl' 
                    : 'w-[140px] aspect-[3/4] rounded-md hover:shadow-lg'
                }`}
                onClick={() => {
                  if (viewMode === 'grid') setViewMode('detail');
                }}
              >
                {/* Preview Content */}
                <div className="w-full h-full pointer-events-none">
                   {/* GridモードのときはPreviewを簡易表示にするなどの最適化も可能 */}
                   <PageCanvasPreview page={page} className="w-full h-full" />
                </div>

                {/* Edit Button (Detail Mode Only) */}
                {viewMode === 'detail' && (
                  <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); }}
                      className="bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 active:scale-95 transition-transform"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
                
                {/* Overlay for Grid Mode (to catch clicks) */}
                {viewMode === 'grid' && (
                  <div className="absolute inset-0 bg-transparent" />
                )}
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-[50vh] text-gray-400">
               <p className="mb-4">No pages yet</p>
            </div>
          )}

          {/* New Page Button (Last Item) */}
          <motion.button
            layout
            onClick={() => onCreatePage(notebook.id)}
            className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-white/50 transition-colors ${
               viewMode === 'detail' 
                 ? 'w-[85vw] md:w-[500px] aspect-[3/4] rounded-lg mx-2 snap-center shrink-0' 
                 : 'w-[140px] aspect-[3/4] rounded-md'
            }`}
          >
            <Plus size={48} strokeWidth={1} />
            <span className="mt-2 text-sm font-bold">New Page</span>
          </motion.button>

        </div>
      </div>

    </div>
  );
};