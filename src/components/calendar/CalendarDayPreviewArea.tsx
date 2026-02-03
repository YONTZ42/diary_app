import React, { useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // 表示されたら自動的にスクロールして見せる
  useEffect(() => {
    if (date && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [date]);

  if (!date) return null;

  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto mt-8 overflow-hidden"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-3">
                {dateStr}
                <span className="bg-gray-100 text-gray-500 text-xs font-sans font-bold px-2 py-1 rounded-full">
                  {pages.length} Entries
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onCreateNew}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 transition active:scale-95"
              >
                <Plus size={16} />
                Create New
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Area */}
          <div className="relative w-full overflow-x-auto pb-4 -mx-2 px-2">
            <div className="flex gap-6 min-w-max">
              {pages.length > 0 ? (
                pages.map((page) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group cursor-pointer"
                    onClick={() => onEditPage(page)}
                  >
                    {/* Preview Card */}
                    {/* aspect-[3/4] で手帳比率を維持しつつ、高さ400px程度で見やすく */}
                    <div className="w-[300px] h-[400px] shadow-lg rounded-xl overflow-hidden border border-gray-100 bg-white transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                      {/* ポインターイベントを無効化してカード全体のクリックを優先 */}
                      <div className="w-full h-full pointer-events-none">
                         <PageCanvasPreview page={page} className="w-full h-full" />
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                   <p className="font-serif italic text-lg mb-2">No diary entries for this day.</p>
                   <p className="text-sm">Tap "Create New" to start writing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};