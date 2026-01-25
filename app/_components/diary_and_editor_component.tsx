"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  PenTool, Check, Type, Palette, Star, 
  Image as ImageIcon 
} from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";

// Tldraw本体をSSR無効でインポート
const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
});

import { Editor, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";

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

  // 1. Storeの初期化をより堅牢に。
  // IDが変わったときだけ確実に再生成されるようにし、外部変数の影響を受けないようにします。
  const store = useMemo(() => {
    const newStore = createTLStore({ shapeUtils: defaultShapeUtils });
    // もし既存のdrawingDataがあればここでロードする処理を将来的に追加可能
    return newStore;
  }, [article.id]);

  // 2. 読み取り専用モードでのズーム調整を安定化
  useEffect(() => {
    if (!editor || !readOnly) return;

    // Vercel上のレンダリング遅延に対応するため、少し長めの待機時間を設定
    const timer = setTimeout(() => {
      editor.zoomToFit({ animation: { duration: 0 } });
      // resizeを強制的に通知する
      window.dispatchEvent(new Event('resize'));
    }, 500);

    return () => clearTimeout(timer);
  }, [editor, readOnly, article.id]);

  return (
    <div 
        onClick={onClick}
        className={clsx(
            "relative bg-white shadow-xl flex flex-col overflow-hidden rounded-[2px] isolate",
            styleClass
        )}
    >
      {/* Header Overlay (z-indexを調整) */}
      <div className={clsx(
          "absolute top-0 w-full p-4 flex justify-between items-start z-40 pointer-events-none transition-opacity duration-300",
          !readOnly ? "opacity-0" : "opacity-100"
        )}>
        {/* ... (中身は同じ) */}
      </div>

      {/* Tldraw Area (70%) */}
      <div className="h-[70%] min-h-[70%] w-full bg-stone-100 relative overflow-hidden z-10 border-b border-stone-100">
        {useTldraw ? (
            <div 
              key={`tldraw-wrapper-${article.id}-${readOnly}`} // keyを付けて確実に再描画させる
              className="w-full h-full relative" 
              onPointerDown={(e) => !readOnly && e.stopPropagation()}
            >
                <Tldraw 
                    store={store}
                    hideUi={readOnly}
                    onMount={(ed) => {
                        setEditor(ed);
                        // readOnlyが変化した際などに確実にフォーカスを制御
                        if (readOnly) ed.blur();
                    }}
                    // Vercelでのクラッシュを防ぐための設定
                    autoFocus={!readOnly}
                    inferDarkMode={false}
                />
                {/* 閲覧モード時は完全に透明な板を置いて入力を遮断 */}
                {readOnly && <div className="absolute inset-0 z-30 bg-transparent touch-none" />}
            </div>
        ) : (
            <div className="w-full h-full">
                {article.imageUrl && <img src={article.imageUrl} className="w-full h-full object-cover" alt="" />}
            </div>
        )}
      </div>

      {/* Content Area (30%) */}
      {/* ... (既存のコード) */}
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
            <span className="text-[10px] font-bold uppercase tracking-widest font-bold">Done</span>
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