"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, ChevronRight, PenTool, Upload, Check, Loader2, Quote } from "lucide-react";
import clsx from "clsx";

// --- Types ---

type ThemeOption = {
  id: string;
  label: string;
  title: string;
  desc: string;
  defaultTitle: string;
  color: string;
};

// --- Mock Data ---

const THEMES: ThemeOption[] = [
  {
    id: "reflection",
    label: "内省",
    title: "静寂の予兆",
    desc: "心の微細な揺れを記録する。",
    defaultTitle: "26歳の微熱",
    color: "bg-indigo-50 border-indigo-200 text-indigo-900"
  },
  {
    id: "challenge",
    label: "挑戦",
    title: "未完成の美学",
    desc: "立ち向かうプロセスを追う。",
    defaultTitle: "月曜日のストイシズム",
    color: "bg-amber-50 border-amber-200 text-amber-900"
  },
  {
    id: "observation",
    label: "観察",
    title: "街と光と私",
    desc: "客観的な視点で景色を撮る。",
    defaultTitle: "Tokyo Daylight",
    color: "bg-emerald-50 border-emerald-200 text-emerald-900"
  }
];

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
];

// --- Sub Components ---

/**
 * Magazine Preview Card
 */
const MagazinePreview = ({
  theme,
  title,
  coverImage,
}: {
  theme: ThemeOption;
  title: string;
  coverImage: string | null;
}) => {
  return (
    <div className="sticky top-24 w-full max-w-sm mx-auto aspect-[3/4] bg-white p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] relative transition-all duration-500 group border border-stone-100">
      {/* Image Container */}
      <div className="relative w-full h-full overflow-hidden bg-stone-100">
        {coverImage ? (
          <img src={coverImage} className="w-full h-full object-cover animate-in fade-in duration-700 filter contrast-[1.05]" alt="Cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-50 gap-3 border-2 border-dashed border-stone-200">
            <div className="w-16 h-16 rounded-full border border-stone-300 flex items-center justify-center bg-white">
                <Camera size={24} className="text-stone-400" />
            </div>
            <span className="text-[9px] font-serif tracking-[0.2em] uppercase text-stone-400">Select Character</span>
          </div>
        )}
        
        {/* Overlays */}
        {coverImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent pointer-events-none" />
        )}
        
        {/* Typography Layer */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none text-white mix-blend-hard-light">
            {/* Header */}
            <div className="flex justify-between items-start opacity-90">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase border-b border-white/40 pb-1 mb-1">
                        Weekly Persona
                    </span>
                    <span className="text-[8px] font-serif italic">Vol.01</span>
                </div>
                <div className="bg-white/90 text-stone-900 px-2 py-1 text-[8px] font-bold tracking-widest uppercase shadow-sm">
                    {theme.label} Issue
                </div>
            </div>

            {/* Title Main */}
            <div className="mb-4">
                <h1 className="font-serif text-5xl leading-[1] mb-4 drop-shadow-xl break-words italic tracking-tight">
                    {title || "Untitled"}
                </h1>
                <div className="flex items-center gap-3 opacity-90">
                    <div className="h-px w-8 bg-white" />
                    <p className="text-[10px] font-light tracking-widest uppercase">
                        {theme.desc}
                    </p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Decorative Tape/Shadow */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-stone-200/30 rotate-1 backdrop-blur-sm" />
    </div>
  );
};

/**
 * Step 1: Character Selector (Enhanced AI Feature)
 */
const CharacterSelector = ({
  selectedImage,
  onSelect,
}: {
  selectedImage: string | null;
  onSelect: (url: string) => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Mock AI Generation Process
  const handleUpload = (file: File) => {
    setIsGenerating(true);
    setTimeout(() => {
        const mockResult = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=90"; 
        setGeneratedImage(mockResult);
        onSelect(mockResult);
        setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2 border-b border-stone-200 pb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-700 text-white text-[10px] font-bold font-serif">I</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Casting Call</h3>
      </div>

      {/* Main Feature: AI Model Generation */}
      <div className="relative group">
          <div className="relative bg-white p-8 border border-stone-200 shadow-sm transition-all duration-500 hover:shadow-md hover:border-red-700/30 flex flex-col items-center justify-center text-center overflow-hidden">
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-stone-300" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-stone-300" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-stone-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-stone-300" />

              {!generatedImage && !isGenerating && (
                  <>
                    <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-100 group-hover:bg-red-50 transition-colors">
                        <Sparkles size={24} className="text-stone-400 group-hover:text-red-700 transition-colors" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 mb-2">
                        AI Casting Director
                    </h4>
                    <p className="text-xs text-stone-500 mb-6 max-w-xs mx-auto leading-relaxed font-serif">
                        写真をアップロードして、今週の「主演モデル」を決定します。AIがシネマティックな一枚に現像します。
                    </p>
                    <label className="cursor-pointer bg-stone-900 text-white text-[10px] font-bold px-8 py-3 tracking-widest uppercase shadow-lg hover:bg-red-700 transition-all flex items-center gap-2">
                        <Camera size={14} />
                        <span>Upload Portrait</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) handleUpload(file);
                        }} />
                    </label>
                  </>
              )}

              {isGenerating && (
                  <div className="py-8 flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-red-700 animate-spin mb-4" />
                      <span className="text-[10px] font-bold text-red-700 animate-pulse tracking-widest uppercase">
                          Developing Film...
                      </span>
                  </div>
              )}

              {generatedImage && (
                  <div className="w-full flex gap-5 items-center animate-in fade-in zoom-in duration-500">
                      <div className="w-24 aspect-[3/4] bg-stone-100 p-1 shadow-md rotate-[-2deg]">
                          <img src={generatedImage} className="w-full h-full object-cover grayscale" alt="AI Model" />
                      </div>
                      <div className="flex-1 text-left">
                          <h4 className="font-serif text-stone-900 text-sm font-bold mb-1">Casting Confirmed</h4>
                          <p className="text-[10px] text-stone-500 mb-3 leading-relaxed">
                              モデルの生成が完了しました。<br/>このビジュアルで撮影を開始します。
                          </p>
                          <button 
                            onClick={() => { setGeneratedImage(null); onSelect(""); }} 
                            className="text-[10px] text-red-700 font-bold underline decoration-red-200 hover:decoration-red-700 transition-all uppercase tracking-wider"
                          >
                              Retake Photo
                          </button>
                      </div>
                      <div className="absolute top-4 right-4">
                          <div className="bg-red-50 text-red-700 p-1 rounded-full border border-red-100">
                              <Check size={14} />
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="pt-2">
          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mb-4 text-center border-b border-stone-100 leading-[0.1em] mx-10">
              <span className="bg-[#fafaf9] px-2">Or Select Archive</span>
          </p>
          <div className="grid grid-cols-3 gap-3 px-2">
            {STOCK_IMAGES.map((url) => (
              <button
                key={url}
                onClick={() => { onSelect(url); setGeneratedImage(null); }}
                className={clsx(
                  "aspect-[3/4] p-1 bg-white shadow-sm hover:shadow-md transition-all relative group",
                  selectedImage === url ? "ring-1 ring-red-700" : "grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                )}
              >
                <div className="w-full h-full overflow-hidden bg-stone-100 relative">
                    <img src={url} className="w-full h-full object-cover" alt="Stock" />
                    {selectedImage === url && (
                        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                            <div className="bg-red-700 text-white p-1 rounded-full shadow-sm"><Check size={12} /></div>
                        </div>
                    )}
                </div>
              </button>
            ))}
          </div>
      </div>
    </div>
  );
};

/**
 * Step 2: Lens Selector
 */
const LensSelector = ({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (theme: ThemeOption) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2 border-b border-stone-200 pb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] font-bold font-serif">II</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Select Direction</h3>
      </div>
      
      <div className="grid gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme)}
            className={clsx(
              "text-left p-5 border transition-all duration-300 relative overflow-hidden group hover:shadow-md",
              selectedId === theme.id
                ? "border-red-700 bg-white shadow-sm"
                : "border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300"
            )}
          >
            {/* Selection Marker */}
            <div className={clsx("absolute top-0 left-0 bottom-0 w-1 transition-colors", selectedId === theme.id ? "bg-red-700" : "bg-transparent group-hover:bg-stone-300")} />
            
            <div className="pl-2">
              <div className="flex justify-between items-center mb-1">
                <span className={clsx("text-[9px] font-bold uppercase tracking-widest", selectedId === theme.id ? "text-red-700" : "text-stone-400")}>
                  The {theme.label} Issue
                </span>
                {selectedId === theme.id && <Check size={14} className="text-red-700" />}
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-900 mb-1 group-hover:text-red-900 transition-colors">
                {theme.title}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed font-serif">
                {theme.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Step 3: Working Title Input
 */
const WorkingTitleInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2 border-b border-stone-200 pb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] font-bold font-serif">III</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Working Title</h3>
      </div>
      
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={20}
          className="w-full bg-transparent border-b border-stone-300 py-3 text-2xl font-serif text-stone-900 placeholder-stone-300 focus:outline-none focus:border-red-700 transition-colors"
        />
        <PenTool size={14} className="absolute right-0 top-4 text-stone-400 group-hover:text-red-700 transition-colors pointer-events-none" />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[9px] text-stone-400 font-serif italic">
            *AI Generated Suggestion
        </p>
        <p className="text-[9px] text-stone-300 font-mono">
            {value.length} / 20
        </p>
      </div>
    </div>
  );
};

/**
 * Step 4: Editorial Memo
 */
const EditorialMemoInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2 border-b border-stone-200 pb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] font-bold font-serif">IV</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Editor's Note</h3>
      </div>
      
      <div className="bg-white border border-stone-200 p-1 shadow-sm focus-within:border-red-700 focus-within:ring-1 focus-within:ring-red-700/10 transition-all">
        <div className="bg-stone-50 p-4 min-h-[100px]">
            <div className="flex items-start gap-2 mb-2">
                <Quote size={12} className="text-stone-300 shrink-0 mt-1" />
                <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="今週の制作意図や、AIへの指示を記述してください..."
                  className="w-full text-sm leading-relaxed resize-none focus:outline-none bg-transparent placeholder:text-stone-400 font-serif text-stone-700"
                  rows={3}
                />
            </div>
        </div>
        <div className="px-3 py-2 bg-white flex justify-between items-center border-t border-stone-100">
            <span className="text-[9px] text-red-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} /> Focus Point
            </span>
            <span className="text-[9px] text-stone-300 font-serif italic">Optional</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function CreateMagazinePage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(THEMES[0]);
  const [title, setTitle] = useState(THEMES[0].defaultTitle);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThemeSelect = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    setTitle(theme.defaultTitle);
  };

  const handleSubmit = () => {
    if(!coverImage) {
        alert("キャスト（写真）を選択してください");
        return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
        console.log("Published!", { selectedTheme, title, coverImage, memo });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 px-8 py-5 flex justify-between items-center bg-[#fafaf9]/90 backdrop-blur-md border-b border-stone-200">
        <button className="flex items-center gap-3 group text-stone-400 hover:text-red-700 transition-colors">
          <ChevronRight size={16} className="rotate-180" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Cancel</span>
        </button>
        <span className="text-[10px] font-serif tracking-[0.2em] uppercase text-stone-400 font-bold">
          Pre-Production
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Left: Preview Area (Sticky on Desktop) */}
        <div className="order-1 lg:order-1 lg:sticky lg:top-32">
            <MagazinePreview 
                theme={selectedTheme} 
                title={title} 
                coverImage={coverImage} 
            />
            <p className="text-center text-[9px] text-stone-400 mt-6 tracking-[0.3em] uppercase font-serif">
                Concept Proof Preview
            </p>
        </div>

        {/* Right: Form Area */}
        <div className="order-2 lg:order-2 space-y-12 max-w-lg mx-auto lg:mx-0 w-full">
            
            <div className="pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-700" />
                    <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-wide">Weekly Crank In</h1>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-serif pl-4 border-l border-stone-200">
                    AI編集部と方向性を共有し、<br/>今週のドキュメンタリー制作を開始します。
                </p>
            </div>

            {/* Step 1 */}
            <CharacterSelector 
                selectedImage={coverImage} 
                onSelect={setCoverImage} 
            />

            {/* Step 2 */}
            <LensSelector 
                selectedId={selectedTheme.id} 
                onSelect={handleThemeSelect} 
            />

            {/* Step 3 */}
            <WorkingTitleInput 
                value={title} 
                onChange={setTitle} 
            />

            {/* Step 4 */}
            <EditorialMemoInput 
                value={memo} 
                onChange={setMemo} 
            />

            {/* Submit Action */}
            <div className="pt-10 border-t border-stone-200">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 text-white text-xs font-bold tracking-[0.3em] py-5 shadow-xl hover:bg-red-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
                    {isSubmitting ? (
                        <span className="animate-pulse">STARTING PRODUCTION...</span>
                    ) : (
                        <>
                            <Camera size={16} />
                            <span>ACTION (撮影開始)</span>
                        </>
                    )}
                </button>
                <p className="text-center text-[9px] text-stone-400 mt-4 font-serif italic">
                    *The documentary will be updated daily.
                </p>
            </div>

        </div>

      </main>
    </div>
  );
}