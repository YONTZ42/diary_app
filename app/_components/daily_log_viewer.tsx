"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Plus, Sparkles, X, ChevronLeft, ChevronRight, Edit3, Save, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";


type Issue = {
  id: string;
  number: string;
  title: string;
  coverUrl: string;
};

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
/**
 * DailyLogViewer Component
 * 「画集」や「ポートフォリオ」のような見開きデザイン
 */
export const DailyLogViewer = ({
  article,
  onClose,
  onNext,
  onPrev,
  onSave,
}: {
  article: Article;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: (updated: Article) => void;
}) => {
  const hasContent = Boolean(article.content || article.title);
  const [isEditing, setIsEditing] = useState(!hasContent);
  const [direction, setDirection] = useState(0); 
  const [draft, setDraft] = useState(article);

  useEffect(() => {
    setDraft(article);
    const hasData = Boolean(article.content || article.title);
    setIsEditing(!hasData);
  }, [article.id]);

  const handlePrev = () => { setDirection(-1); onPrev(); };
  const handleNext = () => { setDirection(1); onNext(); };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) handleNext();
    else if (info.offset.x > swipeThreshold) handlePrev();
  };

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-20 pt-8">
        {/* Control Header */}
        <div className="flex items-center justify-between mb-6 px-2">
             <div className="flex flex-col">
                <span className="text-[10px] text-red-700 font-bold tracking-[0.3em] uppercase">Daily Log</span>
                <span className="text-2xl font-serif text-stone-800 italic">{draft.title || "Untitled"}</span>
             </div>
             
            <div className="flex items-center gap-4">
                 {/* Navigation Buttons - シンプルな矢印 */}
                <div className="flex gap-1">
                    <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-all"><ChevronRight size={16} /></button>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <button onClick={onClose} className="text-stone-400 hover:text-red-700 transition-colors"><X size={24} strokeWidth={1.5} /></button>
            </div>
        </div>

        {/* Main Card - 紙の質感を表現 */}
        <div className="relative bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden min-h-[500px] border border-stone-100">
             <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={article.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full flex flex-col md:flex-row bg-white"
                >
                    {/* Left: Image (Artistic Layout) */}
                    <div className="md:w-1/2 relative bg-stone-50 p-6 md:p-12 flex items-center justify-center group">
                        <div className="relative w-full aspect-[4/5] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] bg-white p-2 transform transition-transform duration-700 group-hover:scale-[1.02]">
                            <img 
                                src={draft.imageUrl} 
                                alt="Day" 
                                className="w-full h-full object-cover filter contrast-[1.05]"
                            />
                            {/* Date Watermark */}
                            <div className="absolute -left-4 -top-6 text-9xl font-serif text-stone-900/5 font-bold z-0 pointer-events-none select-none">
                                {article.date}
                            </div>
                        </div>

                         {isEditing && (
                            <button className="absolute inset-0 flex items-center justify-center z-10">
                               <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-stone-600 shadow-lg border border-stone-100 flex items-center gap-2 hover:text-red-700 transition-colors cursor-pointer">
                                   <ImageIcon size={16} /> <span>Change Photo</span>
                               </div>
                            </button>
                          )}
                    </div>

                    {/* Right: Content (Editorial Layout) */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col h-full relative">
                        <div className="absolute top-8 right-8 z-20">
                            {isEditing ? (
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-full text-xs font-bold tracking-wider hover:bg-red-800 transition-colors shadow-lg shadow-red-700/20"
                                >
                                    <Save size={14} /> SAVE
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-stone-400 hover:text-red-700 px-3 py-1 text-xs font-medium transition-colors"
                                >
                                    <Edit3 size={14} /> EDIT
                                </button>
                            )}
                        </div>

                        {/* Date Header */}
                        <div className="mb-8 border-b border-stone-100 pb-4">
                            <span className="text-xs text-red-700 font-bold uppercase tracking-widest block mb-1">October {2023}</span>
                            <div className="text-4xl font-serif text-stone-800">
                                {String(article.date).padStart(2, '0')}
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-4">
                            {/* Title Input/Display */}
                            <div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={draft.title || ""} 
                                        onChange={(e) => setDraft({...draft, title: e.target.value})}
                                        placeholder="Title of the day..."
                                        className="w-full bg-transparent border-b border-stone-300 text-2xl font-serif text-stone-800 focus:outline-none focus:border-red-700 py-2 placeholder:text-stone-300"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-serif text-stone-800 leading-snug">
                                        {draft.title || <span className="text-stone-300 italic text-lg font-sans">No Title</span>}
                                    </h2>
                                )}
                            </div>

                            {/* Content Input/Display */}
                            <div className="min-h-[120px]">
                                {isEditing ? (
                                    <textarea 
                                        value={draft.content || ""}
                                        onChange={(e) => setDraft({...draft, content: e.target.value})}
                                        placeholder="Write about your day..."
                                        className="w-full h-[200px] bg-stone-50 rounded p-4 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-red-700 resize-none placeholder:text-stone-400 leading-relaxed border-none"
                                    />
                                ) : (
                                    <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap font-serif">
                                        {draft.content || <span className="text-stone-300 italic font-sans">No content written.</span>}
                                    </p>
                                )}
                            </div>

                            {/* Metrics - くすみカラーで上品に */}
                            <div className="pt-6 border-t border-stone-100 grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-3">Mood Color</label>
                                    {isEditing ? (
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={draft.color || "#a8a29e"} // Default stone-400
                                                onChange={(e) => setDraft({...draft, color: e.target.value})}
                                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden" 
                                            />
                                            <span className="text-xs text-stone-500 font-mono">{draft.color || "#---"}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full shadow-sm border border-stone-100" style={{ backgroundColor: draft.color || "#e7e5e4" }} />
                                            <span className="text-[10px] text-stone-500 uppercase tracking-wider">{draft.color ? "Selected" : "No Color"}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-3">Score</label>
                                    {isEditing ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[10px] text-stone-400 font-mono mb-1">
                                                <span>0</span>
                                                <span className="text-red-700 font-bold">{draft.rating || 50}</span>
                                                <span>100</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" 
                                                value={draft.rating || 50}
                                                onChange={(e) => setDraft({...draft, rating: Number(e.target.value)})}
                                                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-700"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-serif text-stone-800">{draft.rating ?? "-"}</span>
                                            <span className="text-[10px] text-stone-400">/ 100</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
             </AnimatePresence>
        </div>
    </div>
  );
};