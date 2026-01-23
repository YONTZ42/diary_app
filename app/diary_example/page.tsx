"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Image as ImageIcon, Type, Palette, Star, 
  PenTool, Calendar, ChevronLeft, Check 
} from "lucide-react";
import clsx from "clsx";

// --- 型定義 ---
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

// --- Mock Data ---
const INITIAL_ARTICLE: Article = {
  id: "art-001",
  date: 14,
  imageUrl: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80",
  title: "Morning Silence",
  content: "The city was wrapped in a gentle mist this morning. I stood by the window with my coffee, watching the world slowly wake up. There's a particular kind of silence at 6 AM that feels almost sacred.",
  color: "#A8A29E",
  rating: 85,
};

// --- Component 1: Magazine Preview (変更なし) ---
const MagazinePreview = ({ article }: { article: Article }) => {
  const accentColor = article.color || "#000000";

  return (
    <div className="w-full h-full bg-white shadow-2xl relative flex flex-col overflow-hidden rounded-[2px] transition-transform duration-500 ease-out origin-top">
      {/* Header Area */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col items-center">
          <span className="text-[40px] font-serif leading-none font-bold text-white drop-shadow-md opacity-90">
            {article.date}
          </span>
          <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white drop-shadow-sm mt-1">
            OCT
          </span>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <circle 
              cx="24" cy="24" r="20" 
              stroke={accentColor} 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="126"
              strokeDashoffset={126 - (126 * (article.rating || 0)) / 100}
              className="drop-shadow-sm transition-all duration-500"
            />
          </svg>
          <span className="text-[10px] font-mono font-bold text-white drop-shadow-md">
            {article.rating}
          </span>
        </div>
      </div>

      {/* Image Area */}
      <div className="h-[55%] w-full bg-stone-100 relative overflow-hidden group">
        {article.imageUrl ? (
          <img 
            src={article.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Article cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ImageIcon size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="flex-grow p-8 relative bg-white">
        <div 
          className="absolute left-6 top-8 bottom-8 w-[2px] opacity-30" 
          style={{ backgroundColor: accentColor }} 
        />
        <div className="pl-6 h-full flex flex-col">
          <h2 className="font-serif text-2xl font-bold italic text-stone-800 mb-4 leading-tight break-words">
            {article.title || "Untitled Story"}
          </h2>
          <p className={clsx(
            "font-serif leading-loose text-stone-600 flex-grow overflow-hidden break-words whitespace-pre-wrap",
            (article.content?.length || 0) < 100 ? "text-sm" : "text-xs text-justify"
          )}>
            {article.content || "No content yet..."}
          </p>
          <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center opacity-50">
             <span className="text-[8px] tracking-widest uppercase text-stone-400">Life is Journal</span>
             <div className="w-8 h-[1px] bg-stone-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component 2: Editor Panel (修正版) ---
const EditorPanel = ({
  article,
  onChange,
  onClose,
}: {
  article: Article;
  onChange: (updated: Article) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      
      {/* 修正: 透明なレイヤーを配置するが、クリックで閉じないように onClick を削除 */}
      {/* 必要なら bg-black/5 などを入れて少し暗くしても良いが、プレビューを見やすくするため透明に */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/10 pointer-events-auto" // 背景クリックをブロックしつつ少し暗く
        // onClick={onClose} // 削除：背景タップで閉じない
      />

      {/* Bottom Sheet */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden pointer-events-auto max-h-[70vh] flex flex-col relative z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white sticky top-0 z-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Editing
          </span>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-1.5 rounded-full hover:bg-stone-700 transition-colors shadow-sm"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
            <Check size={14} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 space-y-8 pb-12 bg-[#F9F8F6]">
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={12}/> Title
            </label>
            <input 
              type="text"
              value={article.title || ""}
              onChange={(e) => onChange({ ...article, title: e.target.value })}
              className="w-full bg-transparent text-xl font-serif font-bold text-stone-800 border-b border-stone-200 focus:border-stone-800 focus:outline-none py-2 transition-colors placeholder:text-stone-300"
              placeholder="Enter title..."
              autoFocus // 開いたときにタイトル入力にフォーカス
            />
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <PenTool size={12}/> Story
            </label>
            <textarea 
              value={article.content || ""}
              onChange={(e) => onChange({ ...article, content: e.target.value })}
              className="w-full h-32 bg-white rounded-xl p-4 text-sm font-serif leading-relaxed text-stone-700 shadow-sm border border-stone-100 focus:ring-1 focus:ring-stone-200 focus:outline-none resize-none"
              placeholder="Write your story here..."
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color Picker */}
            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 space-y-3">
              <label className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-2">
                <Palette size={12}/> Mood Color
              </label>
              <div className="flex items-center gap-3 relative">
                <div 
                  className="w-8 h-8 rounded-full shadow-inner border border-stone-100 transition-colors" 
                  style={{ backgroundColor: article.color || "#000000" }} 
                />
                <input 
                  type="color" 
                  value={article.color || "#000000"}
                  onChange={(e) => onChange({ ...article, color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-[10px] font-mono text-stone-500 uppercase">
                  {article.color}
                </span>
              </div>
            </div>

            {/* Rating Slider */}
            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 space-y-3">
              <label className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-2">
                <Star size={12}/> Rating
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={article.rating || 0}
                  onChange={(e) => onChange({ ...article, rating: parseInt(e.target.value) })}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                />
                <span className="text-xs font-mono font-bold w-6 text-right">
                  {article.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
             <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={12}/> Cover Image URL
            </label>
            <input 
              type="text"
              value={article.imageUrl || ""}
              onChange={(e) => onChange({ ...article, imageUrl: e.target.value })}
              className="w-full bg-white rounded-lg p-3 text-[10px] font-mono text-stone-500 border border-stone-100 focus:outline-none focus:border-stone-300"
              placeholder="https://..."
            />
          </div>

        </div>
      </motion.div>
    </div>
  );
};


// --- Main Page (修正版) ---
export default function PreviewPage() {
  const [article, setArticle] = useState<Article>(INITIAL_ARTICLE);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-[#E5E4E0] flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      {/* Background Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 mix-blend-multiply z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")` }}
      />

      {/* Navigation / Header */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <button className="pointer-events-auto p-2 bg-white/50 backdrop-blur rounded-full text-stone-600 hover:bg-white transition-all shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div className="pointer-events-auto flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-stone-800 transition-colors">
          <Calendar size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Oct 14</span>
        </div>
      </div>

      {/* Main Preview Container */}
      {/* 編集時は少し上にスライドさせてプレビューを見やすくする */}
      <motion.div 
        className="relative z-0 w-full max-w-sm aspect-[3/5] md:aspect-[3/4]"
        animate={{ 
          y: isEditing ? -40 : 0, 
          scale: isEditing ? 0.95 : 1 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <MagazinePreview article={article} />
      </motion.div>

      {/* Floating Action Button for Editing */}
      <AnimatePresence>
        {!isEditing && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsEditing(true)}
            className="fixed bottom-8 right-8 z-20 bg-stone-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
            whileHover={{ rotate: 15 }}
          >
            <PenTool size={20} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <EditorPanel 
            article={article} 
            onChange={setArticle} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}