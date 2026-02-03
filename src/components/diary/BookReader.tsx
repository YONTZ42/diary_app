"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Page, Notebook } from '@/types/schema';
import { PageCanvasPreview } from '@/components/canvas/PageCanvasPreview';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';

interface BookReaderProps {
  notebook: Notebook;
  initialPages: Page[];
  onClose: () => void;
  onUpdatePage: (page: Page) => void;
  onCreatePage: (notebookId: string) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  notebook,
  initialPages,
  onClose,
  onUpdatePage,
  onCreatePage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPages.length > 0 ? initialPages.length - 1 : 0);
  const [prevPageCount, setPrevPageCount] = useState(initialPages.length);
  const [direction, setDirection] = useState(0);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const currentPage = initialPages[currentIndex];

  useEffect(() => {
    if (initialPages.length > prevPageCount) {
      setCurrentIndex(initialPages.length - 1);
      setDirection(1);
    }
    setPrevPageCount(initialPages.length);
  }, [initialPages.length, prevPageCount]);

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < initialPages.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    } else if (nextIndex === initialPages.length) {
      onCreatePage(notebook.id);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0, scale: 0.9, rotateY: direction > 0 ? 15 : -15, zIndex: 0,
    }),
    center: {
      x: 0, opacity: 1, scale: 1, rotateY: 0, zIndex: 1,
      transition: { duration: 0.4, type: "spring" as const, stiffness: 260, damping: 20 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0, scale: 0.9, rotateY: direction < 0 ? 15 : -15, zIndex: 0,
      transition: { duration: 0.3 }
    })
  };

  if (editingPageId && currentPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-white">
        <PageCanvasEditor
          initialPage={currentPage}
          onSave={(updated) => onUpdatePage({ ...currentPage, ...updated })}
          onClose={() => setEditingPageId(null)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F2F0E9]">
      <div className="flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur border-b border-gray-200/50 z-50 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} className="text-gray-600" /></button>
        <div className="text-center">
          <h2 className="font-serif font-bold text-gray-800 text-lg">{notebook.title}</h2>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{initialPages.length > 0 ? currentIndex + 1 : 0} / {initialPages.length}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center perspective-[1200px]">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {currentPage ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentPage.id}
              custom={direction}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              // 高さを明示 (h-[80vh]) し、CSSの3D変形崩れを防ぐ
              className="absolute w-full max-w-lg h-[80vh] px-4"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full relative shadow-2xl rounded-l-sm rounded-r-2xl bg-white flex flex-col">
                <PageCanvasPreview
                  page={currentPage}
                  onEditCanvas={() => setEditingPageId(currentPage.id)}
                  onEditHeader={() => setEditingPageId(currentPage.id)}
                  // w-full h-full で親いっぱいにする
                  className="w-full h-full rounded-l-sm rounded-r-2xl border-l border-l-gray-200"
                />
                <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent pointer-events-none mix-blend-multiply rounded-l-sm z-20" />
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center text-gray-400">
             <p className="mb-4 font-serif">ページがまだありません</p>
             <button onClick={() => onCreatePage(notebook.id)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">最初のページを作る</button>
          </div>
        )}

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-8 pointer-events-none z-30">
          <button onClick={() => paginate(-1)} disabled={currentIndex === 0} className="pointer-events-auto p-4 rounded-full bg-white/90 shadow-xl text-gray-700 disabled:opacity-0 hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"><ChevronLeft size={24} /></button>
          <button onClick={() => paginate(1)} className="pointer-events-auto p-4 rounded-full bg-white/90 shadow-xl text-gray-700 hover:scale-110 active:scale-95 transition-all backdrop-blur-sm flex items-center justify-center">
            {currentIndex === initialPages.length - 1 ? <Plus size={24} className="text-blue-600" /> : <ChevronRight size={24} />}
          </button>
        </div>
      </div>

      <div className="pb-safe pt-4 bg-transparent text-center z-30 mb-8">
         <button onClick={() => currentPage && setEditingPageId(currentPage.id)} disabled={!currentPage} className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full shadow-lg active:scale-95 transition-all hover:bg-slate-800 disabled:opacity-0">
            <span className="font-serif italic text-lg tracking-wide">Edit Page</span>
         </button>
      </div>
    </div>
  );
};