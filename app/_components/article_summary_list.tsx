"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

type Article = {
  id: string;
  date: number;
  imageUrl: string;
  title?: string;
  content?: string;
  color?: string;
  rating?: number;
  issueId?: string;
};

export const ArticleSummaryList = ({
  selectedDate,
  articles,
  onSelectArticle,
}: {
  selectedDate: number | null;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}) => {
  // 選択された日付に該当する記事をフィルタリング
  const dailyArticles = articles.filter((a) => a.date === selectedDate);

  if (!selectedDate) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
         <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
            {dailyArticles.length} Entries for Oct {selectedDate}
         </span>
      </div>

      <AnimatePresence mode="popLayout">
        {dailyArticles.length > 0 ? (
          dailyArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer bg-white rounded-lg border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-300 transition-all overflow-hidden flex items-center h-20"
            >
              {/* Left: Thumbnail */}
              <div className="w-20 h-full bg-stone-100 shrink-0 relative overflow-hidden">
                 <img 
                    src={article.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                 />
                 {article.color && (
                    <div className="absolute top-0 right-0 w-2 h-2" style={{ backgroundColor: article.color }} />
                 )}
              </div>

              {/* Center: Info */}
              <div className="flex-1 px-4 py-2 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono text-stone-400 bg-stone-50 px-1 py-0.5 rounded border border-stone-100">
                        {/* Mock Time */}
                        {10 + i}:00 AM
                    </span>
                    {article.rating && (
                        <span className="text-[9px] font-mono text-red-700/60">
                            Score: {article.rating}
                        </span>
                    )}
                 </div>
                 <h3 className="text-stone-800 font-serif text-lg leading-tight truncate pr-2 group-hover:text-red-800 transition-colors">
                    {article.title || <span className="text-stone-300 italic text-sm">Untitled Log</span>}
                 </h3>
                 <p className="text-[10px] text-stone-500 truncate mt-0.5 opacity-60 font-serif">
                    {article.content || "No preview content..."}
                 </p>
              </div>

              {/* Right: Action */}
              <div className="pr-4 pl-2 text-stone-300 group-hover:text-red-700 transition-colors">
                 <ChevronRight size={18} />
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-8 border-2 border-dashed border-stone-200 rounded-lg"
          >
            <p className="text-stone-400 text-sm font-serif italic">No logs found for this date.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};