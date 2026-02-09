"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, X, Plus, Grip, Maximize2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('detail');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  
  // ページ追加時の自動スクロール用
  const [prevPageCount, setPrevPageCount] = useState(initialPages.length);

  useEffect(() => {
    if (initialPages.length > prevPageCount) {
      setCurrentIndex(initialPages.length - 1);
      setViewMode('detail'); // 新規作成時は詳細モードへ
    }
    setPrevPageCount(initialPages.length);
  }, [initialPages.length, prevPageCount]);

  const currentPage = initialPages[currentIndex];

  // --- Handlers ---

  const handleSelectPage = (index: number) => {
    setCurrentIndex(index);
    setViewMode('detail');
  };

  const handleNext = () => {
    if (currentIndex < initialPages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCreatePage(notebook.id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // スワイプ処理 (Framer Motion)
  const x = useMotionValue(0);
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100) {
      handleNext();
    } else if (info.offset.x > 100) {
      handlePrev();
    }
  };

  // --- Sub Components ---

  // 1. Grid View (Filmstrip)
  const renderGridView = () => (
    <div className="flex-1 overflow-y-hidden overflow-x-auto p-4 flex items-center gap-4 bg-[#F2F0E9]">
      {initialPages.map((page, index) => (
        <motion.div
          key={page.id}
          layoutId={`page-${page.id}`}
          onClick={() => handleSelectPage(index)}
          className={`relative shrink-0 w-40 aspect-[3/4] rounded-lg shadow-md bg-white overflow-hidden cursor-pointer border-2 transition-all ${
            index === currentIndex ? 'border-blue-500 scale-105 z-10' : 'border-transparent opacity-70 hover:opacity-100'
          }`}
        >
          <div className="w-full h-full pointer-events-none">
             <PageCanvasPreview page={page} className="w-full h-full text-[0.3rem]" />
          </div>
          <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] p-1 text-center truncate">
            {page.title || page.date}
          </div>
        </motion.div>
      ))}
      
      {/* New Page Button in Grid */}
      <button
        onClick={() => onCreatePage(notebook.id)}
        className="shrink-0 w-40 aspect-[3/4] rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 transition"
      >
        <Plus size={32} />
        <span className="text-xs font-bold mt-2">New Page</span>
      </button>
    </div>
  );

  // 2. Detail View (Swipeable)
  const renderDetailView = () => (
    <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-[#F2F0E9]">
      <div className="relative w-full max-w-lg h-[80vh] px-4">
        {currentPage ? (
          <motion.div
            key={currentPage.id}
            layoutId={`page-${currentPage.id}`}
            className="w-full h-full bg-white shadow-2xl rounded-l-sm rounded-r-2xl border-l border-l-gray-200 relative overflow-hidden"
            // Simple slide animation
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }} // Fast transition
            
            // Drag logic
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x }}
          >
            <PageCanvasPreview
              page={currentPage}
              onEditCanvas={() => setEditingPageId(currentPage.id)}
              onEditHeader={() => setEditingPageId(currentPage.id)}
              className="w-full h-full"
            />
            
            {/* Page Number Badge */}
            <div className="absolute bottom-4 right-4 bg-black/5 text-gray-400 text-xs px-2 py-1 rounded-full font-mono pointer-events-none">
               {currentIndex + 1} / {initialPages.length}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <p className="mb-4">No pages yet</p>
             <button onClick={() => onCreatePage(notebook.id)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">Create First Page</button>
          </div>
        )}
      </div>

      {/* Navigation Areas (Invisible buttons for clicking sides) */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 cursor-pointer" onClick={handlePrev} />
      <div className="absolute inset-y-0 right-0 w-16 z-10 cursor-pointer" onClick={handleNext} />
    </div>
  );

  // --- Main Render ---

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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-200 z-50">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X size={20} className="text-gray-600" /></button>
        
        <div className="flex flex-col items-center">
          <span className="font-serif font-bold text-gray-800">{notebook.title}</span>
          {/* Mode Switcher (Tab) */}
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg mt-1">
             <button 
               onClick={() => setViewMode('detail')}
               className={`p-1 rounded-md transition-all ${viewMode === 'detail' ? 'bg-white shadow text-black' : 'text-gray-400'}`}
             >
               <Maximize2 size={14} />
             </button>
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'text-gray-400'}`}
             >
               <Grip size={14} />
             </button>
          </div>
        </div>
        
        <div className="w-10" />
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? renderGridView() : renderDetailView()}

      {/* Footer (Detail Mode Only) */}
      {viewMode === 'detail' && (
        <div className="pb-safe pt-2 bg-transparent text-center z-30 mb-6">
           <div className="flex justify-center items-center gap-4">
              <button onClick={() => setViewMode('grid')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1">
                 <Grip size={14} /> Show All
              </button>
              
              <button 
                onClick={() => currentPage && setEditingPageId(currentPage.id)} 
                disabled={!currentPage} 
                className="bg-slate-900 text-white px-6 py-2 rounded-full shadow-lg active:scale-95 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                 Edit Page
              </button>
           </div>
        </div>
      )}
    </div>
  );
};