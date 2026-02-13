import React from 'react'; // useRef, useEffect を削除
import { Page } from '@/types/schema';
import { PageCanvasPreview } from '@/components/canvas/PageCanvasPreview';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarDayPreviewAreaProps {
  date: Date | null;
  pages: Page[];
  onClose: () => void;
  onEditPage: (page: Page) => void;
  onCreateNew: () => void;
}

export const CalendarDayPreviewArea: React.FC<CalendarDayPreviewAreaProps> = ({
  date,
  pages,
  onClose,
  onEditPage,
  onCreateNew,
}) => {
  // useEffectによる自動スクロール処理を削除しました

  if (!date) return null;

  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
 
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto mt-4 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 mb-24 shadow-sm">
          
          {/* Header (Minimal) */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-700 font-serif">
                {dateStr}
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {pages.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onCreateNew}
                className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 transition active:scale-95"
              >
                <Plus size={12} />
                New
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Area (Main Content) */}
          <div className="relative w-full overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="flex gap-4 min-w-max">
              {pages.length > 0 ? (
                pages.map((page) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group cursor-pointer"
                    onClick={() => onEditPage(page)}
                  >
                    {/* Preview Card */}
                    {/* カードサイズは見やすさを維持しつつ少しコンパクトに */}
                    <div className="w-[240px] h-[320px] shadow-md rounded-lg overflow-hidden border border-gray-100 bg-white transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
                      <div className="w-full h-full pointer-events-none">
                         <PageCanvasPreview page={page} className="w-full h-full text-[0.8em]" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-8 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                   <p className="text-xs italic mb-1">No entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};