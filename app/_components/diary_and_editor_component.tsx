"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  PenTool, Check, Type, Palette, Star, 
  Image as ImageIcon 
} from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { Editor, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";

// Tldraw本体をSSR無効でインポート
const Tldraw = dynamic(() => import('tldraw').then((mod) => mod.Tldraw), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 animate-pulse" />
});

// --- 定数・ヘルパー ---

/**
 * 日本語翻訳の不足分を補い、警告を消すための定義
 */
const TLDRAW_MESSAGES = {
  ja: {
    'style-panel.fill-style.lined-fill': '斜線',
    'fill-style.lined-fill': '斜線',
  },
};

/**
 * リスト表示用の軽量設定
 * UIを非表示にし、翻訳エラーを防ぐ
 */
const PREVIEW_OVERRIDES = {
  translations: TLDRAW_MESSAGES,
};

export type Article = {
  id: string;
  date: number;
  imageUrl: string;
  title?: string;
  content?: string;
  color?: string;
  rating?: number;
  issueId?: string;
};

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return {
    year: d.getFullYear(),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate().toString().padStart(2, '0'),
  };
};

// --- コンポーネント ---

export const MagazinePreview = ({ 
    article, 
    onClick, 
    styleClass = "", 
    useTldraw = true, 
    readOnly = true 
}: { 
    article: Article; 
    onClick?: () => void; 
    styleClass?: string;
    useTldraw?: boolean;
    readOnly?: boolean;
}) => {
  const accentColor = article.color || "#000000";
  const [editor, setEditor] = useState<Editor | null>(null);
  const { year, month, day } = formatDate(article.date);

  // Storeの初期化をより安定させる
  const store = useMemo(() => {
    const newStore = createTLStore({ shapeUtils: defaultShapeUtils });
    // 必要であればここで初期データをロード
    return newStore;
  }, [article.id]);

  useEffect(() => {
    if (!editor || !readOnly) return;
    
    // 描画範囲にズームを合わせる（少し遅延させて確実に行う）
    const timer = setTimeout(() => {
      editor.zoomToFit({ animation: { duration: 0 } });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [editor, readOnly]);

  return (
    <div 
        onClick={onClick}
        className={clsx(
            "relative bg-white shadow-xl flex flex-col overflow-hidden rounded-[2px] isolate transition-all duration-300",
            styleClass || "aspect-[3/4]"
        )}
    >
      {/* Header Overlay */}
      <div className={clsx(
          "absolute top-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none transition-opacity duration-300",
          !readOnly ? "opacity-0" : "opacity-100"
        )}>
        <div className="flex flex-col items-center bg-black/20 backdrop-blur-md p-1 px-2 rounded">
          <span className="text-[10px] font-mono font-bold text-white leading-none mb-1 opacity-80">{year}</span>
          <span className="text-4xl font-serif leading-none font-bold text-white">{day}</span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mt-1 border-t border-white/40 pt-1">{month}</span>
        </div>
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="16" cy="16" r="14" stroke={accentColor} strokeWidth="2" fill="none" strokeDasharray="88" strokeDashoffset={88 - (88 * (article.rating || 0)) / 100} />
          </svg>
          <span className="text-[8px] font-mono font-bold text-white">{article.rating}</span>
        </div>
      </div>

      {/* Tldraw Area (70%) */}
      <div className="h-[70%] min-h-[70%] w-full bg-[#fcfaf8] relative overflow-hidden z-10 border-b border-stone-100">
        {useTldraw ? (
            <div 
              key={`tldraw-wrapper-${article.id}`} 
              className="w-full h-full relative" 
            >
                <Tldraw 
                    store={store}
                    hideUi={readOnly}
                    // クラッシュ防止：リスト表示時はUI要素を徹底的に削削る
                    overrides={PREVIEW_OVERRIDES}
                    onMount={(ed) => {
                        setEditor(ed);
                        if (readOnly) {
                          ed.updateInstanceState({ isReadonly: true });
                          ed.blur();
                        }
                    }}
                    autoFocus={false}
                    inferDarkMode={false}
                />
                {/* 閲覧モード時は完全に透明な板を置いてイベント干渉を防ぐ */}
                {readOnly && <div className="absolute inset-0 z-[100] bg-transparent touch-none cursor-pointer" />}
            </div>
        ) : (
            <div className="w-full h-full">
                {article.imageUrl && <img src={article.imageUrl} className="w-full h-full object-cover" alt="" />}
            </div>
        )}
      </div>

      {/* Content Area (30%) */}
      <div className="h-[30%] min-h-[30%] p-4 relative bg-white z-20 flex flex-col justify-center">
        <div className="absolute left-4 top-4 bottom-4 w-[2px]" style={{ backgroundColor: accentColor }} />
        <div className="pl-4 overflow-hidden">
          <h2 className="font-serif text-lg font-bold italic text-stone-800 mb-1 leading-tight truncate">
            {article.title || "Untitled"}
          </h2>
          <p className="font-serif text-[10px] leading-relaxed text-stone-600 line-clamp-3 whitespace-pre-wrap">
            {article.content || "No content..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export const EditorPanel = ({
  article,
  onChange,
  onClose,
}: {
  article: Article;
  onChange: (updated: Article) => void;
  onClose: () => void;
}) => {
  // 編集パネル側でも翻訳エラーを防ぐ
  const editorOverrides = useMemo(() => ({
    translations: TLDRAW_MESSAGES
  }), []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose} 
      />
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full rounded-t-[32px] shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editor Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white sticky top-0 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Editing Story</span>
          <button onClick={onClose} className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
            <Check size={16} />
          </button>
        </div>
        
        {/* Editor Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 bg-[#F9F8F6]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest"><Type size={12}/> Title</label>
            <input 
              type="text" 
              value={article.title || ""} 
              onChange={(e) => onChange({ ...article, title: e.target.value })}
              className="w-full bg-transparent text-2xl font-serif font-bold text-stone-800 border-b border-stone-200 focus:border-stone-800 focus:outline-none py-2 transition-colors" 
              placeholder="Title..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest"><PenTool size={12}/> Story</label>
            <textarea 
              value={article.content || ""} 
              onChange={(e) => onChange({ ...article, content: e.target.value })}
              className="w-full h-48 bg-white rounded-2xl p-5 text-base font-serif leading-relaxed text-stone-700 shadow-sm border-none resize-none focus:ring-2 focus:ring-stone-200 transition-all" 
              placeholder="Write your story..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pb-10">
            <div className="p-5 bg-white rounded-2xl shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest"><Palette size={12}/> Color</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-stone-100 shadow-inner" style={{ backgroundColor: article.color || "#000000" }} />
                <input 
                  type="color" 
                  value={article.color || "#000000"} 
                  onChange={(e) => onChange({ ...article, color: e.target.value })} 
                  className="flex-1 h-8 cursor-pointer opacity-0 absolute w-10"
                />
                <span className="text-xs font-mono text-stone-500 uppercase">{article.color || "#000000"}</span>
              </div>
            </div>
            
            <div className="p-5 bg-white rounded-2xl shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest"><Star size={12}/> Rating</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="range" min="0" max="100" 
                  value={article.rating || 0} 
                  onChange={(e) => onChange({ ...article, rating: parseInt(e.target.value) })} 
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-800 shadow-inner"
                />
                <span className="text-right text-xs font-mono font-bold text-stone-800">{article.rating}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};