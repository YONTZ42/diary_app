"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, Check, Smile, Activity, Image as ImageIcon, 
  ChevronDown, Type, Palette 
} from "lucide-react";
import clsx from "clsx";

// --- 型定義 ---
interface DiaryMetadata {
  mood?: string;
  color?: string;
  metrics?: { label: string; value: string }[];
}

interface DiaryData {
  id: string;
  date: string;
  content: string;
  image?: string;
  metadata?: DiaryMetadata;
}

export const MobileDiaryEditor = ({
  initialData,
  onSave,
  onClose,
}: {
  initialData: DiaryData;
  onSave: (updated: DiaryData) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState<DiaryData>({
    ...initialData,
    metadata: {
      mood: initialData.metadata?.mood || "Calm",
      color: initialData.metadata?.color || "#A8A29E",
      metrics: initialData.metadata?.metrics || [{ label: "Sleep", value: "7h" }],
    },
  });

  const metadata = draft.metadata!;
  const accentColor = metadata.color || "#A8A29E";

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden select-none">
      {/* 1. Header: モバイルで押しやすいサイズ */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-stone-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <button onClick={onClose} className="p-2 -ml-2 text-stone-400">
          <X size={22} />
        </button>
        <div className="text-center">
          <span className="text-[9px] font-mono tracking-[0.2em] text-stone-400 block uppercase">Editing</span>
          <span className="text-xs font-serif italic font-bold">{draft.date}</span>
        </div>
        <button 
          onClick={() => onSave(draft)}
          className="text-xs font-bold tracking-widest text-blue-600 px-2"
        >
          DONE
        </button>
      </header>

      {/* 2. Main Content: スクロールエリア */}
      <div className="flex-grow overflow-y-auto bg-[#F9F8F6]">
        
        {/* 上半分: 雑誌プレビュー (モバイル画面の約50-60%) */}
        <div className="w-full bg-[#F0EFEA] p-4 flex justify-center items-center sticky top-0 z-10 shadow-sm">
          <div className="w-full max-w-[280px] aspect-[3/4] bg-white shadow-xl relative flex flex-col overflow-hidden rounded-[1px]">
             {/* メタデータ視覚化 */}
             <div className="absolute top-6 right-6 text-right space-y-1 z-20 scale-75 origin-right">
                {metadata.metrics?.map((m, i) => (
                  <div key={i} className="flex flex-col items-end leading-none mb-1">
                    <span className="text-[6px] uppercase text-stone-400">{m.label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>{m.value}</span>
                  </div>
                ))}
             </div>
             
             {/* 写真エリア */}
             <div className="h-1/2 w-full bg-stone-100 relative">
               {draft.image ? (
                 <img src={draft.image} className="w-full h-full object-cover grayscale-[20%]" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-stone-300">
                   <ImageIcon size={32} strokeWidth={1} />
                 </div>
               )}
             </div>

             {/* 本文エリア */}
             <div className="p-6 flex-grow relative">
                <div className="absolute left-4 top-4 bottom-4 w-[0.5px] opacity-20" style={{ backgroundColor: accentColor }} />
                <p className={clsx(
                  "font-serif leading-relaxed text-stone-800 transition-all duration-300",
                  draft.content.length < 40 ? "text-sm italic" : "text-[10px] text-justify"
                )}>
                  {draft.content || "Writing..."}
                </p>
             </div>

             {/* フッター */}
             <div className="px-6 pb-4 flex justify-between items-end">
                <div className="flex gap-[1px] items-end h-3 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-black w-[0.5px]" style={{ height: `${Math.random() * 100}%` }} />
                  ))}
                </div>
                <span className="text-[7px] font-mono text-stone-300 uppercase leading-none">{draft.date}</span>
             </div>
          </div>
        </div>

        {/* 下半分: モバイル操作パネル */}
        <div className="bg-white rounded-t-[32px] -mt-6 relative z-20 px-6 pt-8 pb-32 space-y-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          
          {/* テキスト入力: 画面下部にあるので指が届きやすい */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-400">
              <Type size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase">The Story</span>
            </div>
            <textarea 
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              className="w-full h-32 bg-stone-50 rounded-2xl p-4 text-sm font-serif leading-relaxed focus:ring-1 focus:ring-stone-200 border-none resize-none"
              placeholder="今日という日の物語..."
            />
          </div>

          {/* メタデータ設定: 水平スクロールまたはグリッド */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl space-y-3">
              <label className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-2">
                <Smile size={12}/> Mood
              </label>
              <select 
                value={metadata.mood}
                onChange={(e) => setDraft({ ...draft, metadata: { ...metadata, mood: e.target.value } })}
                className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
              >
                <option value="Relax">Relax</option>
                <option value="Productive">Productive</option>
                <option value="Emotional">Emotional</option>
              </select>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-3">
              <label className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-2">
                <Palette size={12}/> Color
              </label>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full shadow-inner border border-white" style={{ backgroundColor: accentColor }} />
                <input 
                  type="color" 
                  value={accentColor}
                  onChange={(e) => setDraft({ ...draft, metadata: { ...metadata, color: e.target.value } })}
                  className="opacity-0 absolute w-10 h-10 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-stone-400 uppercase">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* 数値データ入力 */}
          <div className="p-4 bg-stone-50 rounded-2xl space-y-4">
            <label className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-2">
              <Activity size={12}/> Quick Metrics
            </label>
            {metadata.metrics?.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input 
                  placeholder="Label" 
                  value={m.label} 
                  onChange={(e) => {
                    const newM = [...metadata.metrics!];
                    newM[i].label = e.target.value;
                    setDraft({...draft, metadata: {...metadata, metrics: newM}});
                  }}
                  className="w-1/2 bg-white border-none rounded-lg text-[10px] p-2 shadow-sm"
                />
                <input 
                  placeholder="Val" 
                  value={m.value}
                  onChange={(e) => {
                    const newM = [...metadata.metrics!];
                    newM[i].value = e.target.value;
                    setDraft({...draft, metadata: {...metadata, metrics: newM}});
                  }}
                  className="w-1/2 bg-white border-none rounded-lg text-[10px] p-2 shadow-sm font-mono font-bold"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MobileDiaryEditor;