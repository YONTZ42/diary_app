"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  ChevronRight,
  LayoutGrid,
  Upload,
  MessageCircle,
  X,
  Send,
  Sparkles,
  PenTool,
  Quote
} from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface MagazineConfig {
    title: string;          // VOGUE part
    verticalText: string;   // Japanese vertical text
    mainHeading: string;    // Be the Star part
    subHeading: string;     // Feature Model part
    issueDate: string;      // AUG / VOL.04
}

// --- Mock Data ---
const MODEL_LIBRARY = [
    { id: 1, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", name: "Classic" },
    { id: 2, url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80", name: "Ethereal" },
    { id: 3, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", name: "Urban" },
    { id: 4, url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80", name: "Noir" },
    { id: 5, url: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80", name: "Vivid" },
];

const AI_GENERATED_RESULT = "https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?w=800&q=80"; 

const INTERVIEW_QUESTIONS = [
    "今日のあなたを、色に例えるなら何色ですか？",
    "誰にも言えない、小さな秘密はありますか？",
    "その瞬間、心臓の音は聞こえていましたか？"
];

const DEFAULT_MAGAZINE_CONFIG: MagazineConfig = {
    title: "VOGUE",
    verticalText: "私という\n現象。",
    mainHeading: "Be the Star.",
    subHeading: "Feature Model",
    issueDate: "OCT"
};

// --- Components ---

/**
 * 1. Magazine Cover Style Podium
 */
interface MagazineCoverProps {
    currentImage: string;
    config: MagazineConfig;
    onUploadStart: () => void;
    onUploadComplete: (imgUrl: string) => void;
    isGenerating: boolean;
}

const MagazineCover = ({ currentImage, config, onUploadStart, onUploadComplete, isGenerating }: MagazineCoverProps) => {
    
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadStart();
            const objectUrl = URL.createObjectURL(file);
            setTimeout(() => {
                onUploadComplete(objectUrl);
            }, 2500);
        }
    };

    return (
        <div className="w-full relative z-10 px-6 pt-8 pb-12">
            {/* Background Title Watermark */}

            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[140px] font-serif font-black text-stone-200/50 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none opacity-40">
                {config.title}
            </div>

            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] bg-white p-1.5 group transition-transform duration-700">
                
                {/* Image Container */}
                <div className="relative w-full h-full overflow-hidden bg-stone-100">
                    <motion.img 
                        key={currentImage}
                        initial={{ scale: 1.1, opacity: 0, filter: "blur(10px) grayscale(100%)" }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px) grayscale(0%)" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        src={currentImage}
                        className={clsx("w-full h-full object-cover transition-all duration-700 filter contrast-[1.05]", isGenerating && "blur-xl opacity-60 scale-105")}
                    />

                    {/* Magazine Overlays */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="bg-red-700 text-white text-[9px] font-bold px-3 py-1 tracking-[0.2em] uppercase shadow-sm">
                                Special Issue
                            </div>
                            <div className="text-right mix-blend-difference text-white">
                                <span className="block text-4xl font-serif leading-none opacity-90">{config.issueDate}</span>
                                <span className="block text-[9px] tracking-[0.3em] opacity-80 mt-1">VOL.04</span>
                            </div>
                        </div>

                        {/* Vertical Text */}
                        <div className="absolute top-24 left-6 [writing-mode:vertical-rl] text-white drop-shadow-md space-y-6">
                            <p className="text-3xl font-serif font-bold tracking-widest text-white whitespace-pre-wrap leading-relaxed drop-shadow-lg">
                                {config.verticalText}
                            </p>
                            <p className="text-[10px] tracking-[0.25em] opacity-90 border-r border-white/60 pr-3 my-4">
                                今週のミューズ
                            </p>
                        </div>

                        {/* Footer Texts */}
                        <div className="text-right space-y-2 pb-8">
                            <h2 className="text-4xl font-serif text-white font-bold italic drop-shadow-lg">
                                <span className="text-red-500 block text-xs font-sans not-italic font-bold mb-1 tracking-[0.3em] uppercase drop-shadow-sm">{config.subHeading}</span>
                                {config.mainHeading}
                            </h2>
                            <div className="w-12 h-0.5 bg-white/80 ml-auto mb-2" />
                            <p className="text-[10px] text-white/90 tracking-wider font-serif leading-relaxed drop-shadow-md">
                                あなただけのスタイル、<br/>AIが引き出す新しい表情。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-30 backdrop-blur-sm"
                        >
                            <div className="w-12 h-12 border-2 border-stone-200 border-t-red-700 rounded-full animate-spin" />
                            <span className="mt-4 text-red-700 font-serif text-xs uppercase tracking-widest animate-pulse">
                                Developing...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Button (Floating) */}
                <label className="absolute -bottom-6 right-6 z-40 cursor-pointer group/btn">
                    <div className="flex items-center gap-3 bg-stone-900 text-white pl-5 pr-2 py-3 shadow-xl hover:bg-red-800 transition-all hover:-translate-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest mr-1">New Shot</span>
                        <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                            <Camera size={16} />
                        </div>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isGenerating} />
                </label>
            </div>
        </div>
    );
};

/**
 * 2. Model Library Selector
 * "Contact Sheet" Style
 */
interface ModelLibraryProps {
    onSelect: (url: string) => void;
    activeUrl: string;
}

const ModelLibrary = ({ onSelect, activeUrl }: ModelLibraryProps) => {
    return (
        <div className="mb-16 px-6">
            <div className="flex items-center gap-3 mb-4 border-b border-stone-200 pb-2">
                <LayoutGrid size={14} className="text-red-700" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">Contact Sheet</span>
            </div>
            
            <div className="overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
                <div className="flex gap-4 min-w-max">
                    {/* Upload Placeholder */}
                    <button className="w-20 h-24 bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:text-red-700 hover:border-red-700 transition-all gap-2 shrink-0 group">
                        <Upload size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-serif tracking-wider uppercase">Import</span>
                    </button>

                    {MODEL_LIBRARY.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => onSelect(model.url)}
                            className={clsx(
                                "relative w-20 h-24 overflow-hidden border transition-all shrink-0 group",
                                activeUrl === model.url 
                                    ? "border-red-700 shadow-lg scale-105 z-10" 
                                    : "border-stone-200 grayscale hover:grayscale-0"
                            )}
                        >
                            <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                            
                            {/* Film Frame Numbers */}
                            <div className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white/80 bg-black/40 px-1">
                                0{model.id}
                            </div>
                            
                            {activeUrl === model.url && (
                                <div className="absolute inset-0 ring-2 ring-red-700/50 pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * 3. Daily Interview
 * Editorial Style Q&A
 */
const DailyInterview = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<Array<{ type: 'ai' | 'user', text: string }>>([
        { type: 'ai', text: INTERVIEW_QUESTIONS[0] }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [step, setStep] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newHistory = [...history, { type: 'user' as const, text: inputValue }];
        setHistory(newHistory);
        setInputValue("");

        if (step < INTERVIEW_QUESTIONS.length - 1) {
            setTimeout(() => {
                setHistory(prev => [...prev, { type: 'ai', text: INTERVIEW_QUESTIONS[step + 1] }]);
                setStep(s => s + 1);
            }, 800);
        } else {
            setTimeout(() => {
                setHistory(prev => [...prev, { type: 'ai', text: "記録しました。素晴らしい感性です。" }]);
            }, 800);
        }
    };

    useEffect(() => {
        if(isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isOpen]);

    return (
        <div className="px-6 mb-12 flex justify-center">
            {/* Trigger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full max-w-md bg-white border border-stone-200 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
                <div className="flex items-center justify-between">
                    <div className="flex flex-col text-left">
                        <span className="flex items-center gap-2 text-[10px] text-red-700 font-bold uppercase tracking-[0.2em] mb-2">
                            <PenTool size={12} /> Editorial Interview
                        </span>
                        <span className="text-xl font-serif text-stone-800 italic group-hover:text-red-900 transition-colors">
                            Today's Question
                        </span>
                        <span className="text-xs text-stone-400 mt-1 font-serif">
                            Tap to start writing...
                        </span>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                        <Quote size={18} />
                    </div>
                </div>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-stone-50/95 backdrop-blur-md flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-stone-200 flex justify-between items-center bg-white/50">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={16} className="text-red-700" />
                                <span className="text-xs font-bold text-stone-800 uppercase tracking-widest">Interview Session</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-red-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 max-w-2xl mx-auto w-full">
                            {history.map((msg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={clsx("flex flex-col gap-2", msg.type === 'user' ? "items-end" : "items-start")}
                                >
                                    {msg.type === 'ai' && (
                                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Editor</span>
                                    )}
                                    <div className={clsx(
                                        "max-w-[85%] text-base font-serif leading-loose p-4",
                                        msg.type === 'user' 
                                            ? "text-stone-800 border-l-2 border-red-700 bg-white shadow-sm" 
                                            : "text-stone-600 bg-stone-100/50 italic"
                                    )}>
                                        {msg.text}
                                    </div>
                                    {msg.type === 'user' && (
                                        <span className="text-[9px] text-stone-400 font-mono">YOU</span>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-stone-200">
                            <div className="max-w-2xl mx-auto relative">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full bg-stone-50 border border-stone-200 py-4 px-6 pr-14 text-sm font-serif text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700/20 transition-all shadow-inner"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    autoFocus
                                />
                                <button 
                                    onClick={handleSend}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-stone-900 text-white hover:bg-red-700 transition-colors disabled:opacity-30 disabled:hover:bg-stone-900"
                                    disabled={!inputValue.trim()}
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page ---

export default function CharacterStagePage() {
    const [currentModelImage, setCurrentModelImage] = useState(MODEL_LIBRARY[0].url);
    const [isGenerating, setIsGenerating] = useState(false);
    const [magazineConfig, setMagazineConfig] = useState<MagazineConfig>(DEFAULT_MAGAZINE_CONFIG);

    const handleUploadStart = () => {
        setIsGenerating(true);
    };

    const handleUploadComplete = (newUrl: string) => {
        setCurrentModelImage(newUrl);
        setIsGenerating(false);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-red-100 selection:text-red-900 pb-20 relative overflow-x-hidden">
        
            <header className="px-8 pt-2 pb-6 flex justify-between items-end z-20 shrink-0">
                <div className="cursor-pointer group">
                <h1 className="font-serif text-3xl text-stone-900 tracking-wide font-medium group-hover:text-red-800 transition-colors">Life is Journal.</h1>
                <p className="text-[10px] text-red-700 uppercase tracking-[0.3em] font-bold mt-1">Archive of Days</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border border-white shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"/>
                </div>
            </header>


        <main className="relative pt-0 max-w-lg mx-auto">
            {/* 1. Magazine Cover */}
            <MagazineCover 
                currentImage={currentModelImage}
                config={magazineConfig}
                isGenerating={isGenerating}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
            />

            {/* 2. Model Library */}
            <ModelLibrary 
                activeUrl={currentModelImage}
                onSelect={(url) => setCurrentModelImage(url)}
            />

            {/* 3. Interview */}
            <DailyInterview />
            
            {/* Decorative Footer */}
            <div className="text-center pb-8 opacity-30">
                <Sparkles size={16} className="mx-auto text-stone-400 mb-2" />
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone-500 font-serif">Life is Journal</p>
            </div>

        </main>
        </div>
    );
}