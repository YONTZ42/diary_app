import React from 'react';
import Image from 'next/image';
import { Notebook } from '@/types/schema';
import { Book } from 'lucide-react';

interface NotebookCardProps {
  notebook: Notebook;
  onClick: () => void;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({ notebook, onClick }) => {
  const coverAsset = notebook.cover;
  
  // 色マップ (プリセットIDの場合に使用)
  const colorMap: Record<string, string> = {
    'cover-blue': 'bg-slate-700',
    'cover-red': 'bg-rose-800',
    'cover-green': 'bg-emerald-800',
    'cover-orange': 'bg-orange-700',
    'cover-black': 'bg-gray-900',
    'cover-brown': 'bg-amber-900',
  };

  // 画像URLがあるかどうか判定
  const isRemoteImage = coverAsset?.kind === 'remote' && coverAsset.key.startsWith('http');
  
  // 色決定 (画像がない場合のフォールバック、またはアクセントカラーとして使用)
  // cover.key が色IDならそれを、画像なら適当なデフォルト色(またはメタデータにあればそれ)を使う
  const bgColor = (!isRemoteImage && coverAsset?.key && colorMap[coverAsset.key]) 
    ? colorMap[coverAsset.key] 
    : 'bg-slate-800'; // 画像ありのときのデフォルト背景

  const pageCount = notebook.pageIds?.length || 0;

  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center gap-3 transition-transform hover:-translate-y-2 w-full"
    >
      <div className={`relative w-full aspect-[3/4] rounded-r-xl rounded-l-sm shadow-xl ${bgColor} flex flex-col justify-between overflow-hidden border-l-4 border-l-black/20 group-hover:shadow-2xl transition-shadow`}>
        
        {/* --- 背景レイヤー --- */}
        {isRemoteImage ? (
          <>
            {/* 写真 */}
            <Image 
              src={coverAsset!.key} 
              alt={notebook.title} 
              fill 
              className="object-cover" 
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {/* 読みやすさのためのグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
          </>
        ) : (
          /* テクスチャ (画像なしの場合) */
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay" />
        )}

        {/* バンド */}
        <div className="absolute right-2 top-0 bottom-0 w-2 bg-black/10 mix-blend-multiply z-10" />

        {/* --- コンテンツレイヤー --- */}
        <div className="z-20 p-4 h-full flex flex-col justify-end">
          <h3 className="text-white font-serif font-bold text-xl leading-tight drop-shadow-md line-clamp-2 mb-1 text-left">
            {notebook.title}
          </h3>
          {notebook.description && (
             <p className="text-white/70 text-[10px] line-clamp-1 text-left font-sans">
               {notebook.description}
             </p>
          )}
          
          <div className="flex justify-between items-center border-t border-white/20 pt-2 mt-3">
             <span className="text-[10px] text-white/80 font-mono font-bold tracking-widest">
               {pageCount} PAGES
             </span>
             <Book size={12} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* 影 */}
      <div className="w-[80%] h-2 bg-black/10 rounded-full blur-sm transition-all group-hover:w-[70%] group-hover:bg-black/20" />
    </button>
  );
};