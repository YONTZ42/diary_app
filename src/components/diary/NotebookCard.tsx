import React from 'react';
import { Notebook } from '@/types/schema';
import { Book } from 'lucide-react';

interface NotebookCardProps {
  notebook: Notebook;
  onClick: () => void;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({ notebook, onClick }) => {
  // 表紙の色をダミーで決定（IDに基づいて色を変えるなど）
  const colorMap: Record<string, string> = {
    'cover-blue': 'bg-slate-700',
    'cover-orange': 'bg-orange-700',
  };
  const bgColor = notebook.cover?.key ? colorMap[notebook.cover.key] || 'bg-gray-700' : 'bg-gray-700';

  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center gap-3 transition-transform hover:-translate-y-2"
    >
      {/* 手帳の表紙（レザー調の質感をCSSで表現） */}
      <div className={`relative w-32 h-44 rounded-r-xl rounded-l-sm shadow-xl ${bgColor} flex flex-col justify-between p-4 border-l-4 border-l-black/20 overflow-hidden`}>
        {/* 質感オーバーレイ */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay" />
        
        {/* バンド（モレスキン風） */}
        <div className="absolute right-2 top-0 bottom-0 w-2 bg-black/20" />

        <div className="z-10 mt-4">
          <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
            {notebook.title}
          </h3>
        </div>

        <div className="z-10 flex justify-between items-end border-t border-white/20 pt-2">
           <span className="text-[10px] text-white/80 font-mono">
             {notebook.pageIds.length} PAGES
           </span>
           <Book size={14} className="text-white/60" />
        </div>
      </div>

      {/* 影 */}
      <div className="w-28 h-2 bg-black/10 rounded-full blur-sm transition-all group-hover:w-20 group-hover:bg-black/20" />
    </button>
  );
};