"use client";

import React, { useState } from 'react';
import { Notebook, Page } from '../types/schema';
import { PageCanvasPreview } from './PageCanvasPreview';
import { motion, AnimatePresence } from 'framer-motion';

interface NotebookReaderModalProps {
  notebook: Notebook;
  allPages: Page[]; // ID解決用に全ページ(または検索済みのページ)を渡す
  onClose: () => void;
}

export const NotebookReaderModal: React.FC<NotebookReaderModalProps> = ({ 
  notebook, 
  allPages, 
  onClose 
}) => {
  // ページID配列に対応する実際のPageオブジェクトを取得
  const notebookPages = notebook.pageIds
    .map(id => allPages.find(p => p.id === id))
    .filter((p): p is Page => p !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPage = notebookPages[currentIndex];

  const handleNext = () => {
    if (currentIndex < notebookPages.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        ✕
      </button>

      {/* Main Content Area */}
      <div className="w-full max-w-md h-[80vh] relative flex flex-col">
        
        {/* Header Info */}
        <div className="text-center mb-4 text-white">
          <h2 className="text-lg font-bold">{notebook.title}</h2>
          <p className="text-xs text-white/60">
            {notebookPages.length > 0 
               ? `${currentIndex + 1} / ${notebookPages.length}`
               : 'No pages yet'}
          </p>
        </div>

        {/* Page Viewer */}
        <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-2xl">
          {notebookPages.length > 0 ? (
            <AnimatePresence mode='wait'>
               {/* ページめくりアニメーション付きで表示 */}
               <motion.div
                 key={currentPage.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
                 className="w-full h-full"
               >
                 <PageCanvasPreview page={currentPage} />
               </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">📝</span>
              <p>このノートにはまだページがありません</p>
            </div>
          )}

          {/* Navigation Overlay (左右タップエリア) */}
          <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={handleNext} />
        </div>

        {/* Navigation Controls (Bottom) */}
        <div className="mt-6 flex justify-center items-center gap-6">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-white text-2xl disabled:opacity-30 hover:scale-110 transition"
          >
            ←
          </button>
          
          {/* Seek Bar */}
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 transition-all duration-300"
               style={{ 
                 width: notebookPages.length > 0 
                   ? `${((currentIndex + 1) / notebookPages.length) * 100}%` 
                   : '0%' 
               }}
             />
          </div>

          <button 
            onClick={handleNext}
            disabled={currentIndex === notebookPages.length - 1}
            className="text-white text-2xl disabled:opacity-30 hover:scale-110 transition"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};