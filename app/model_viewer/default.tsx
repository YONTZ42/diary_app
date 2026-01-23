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
  Edit3,
  Type,
  AlignVerticalJustifyCenter,
  Check
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
    issueDate: "AUG"
};

// --- Components ---

const AmbientParticles = () => {
    const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number; duration: number }>>([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 15 }).map(() => ({
            x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 5, duration: Math.random() * 5 + 5
        }));
        setParticles(newParticles);
    }, []);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p, i) => (
                <motion.div key={i} className="absolute w-1 h-1 bg-amber-200/20 rounded-full" initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }} animate={{ y: [null, -100], opacity: [0, 0.5, 0] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }} />
            ))}
        </div>
    );
};

/**
 * 1. Magazine Cover Style Podium
 */
interface MagazineCoverProps {
    currentImage: string;
    config: MagazineConfig; // 設定を受け取る
    onUploadStart: () => void;
    onUploadComplete: (imgUrl: string) => void;
    isGenerating: boolean;
}

const MagazineCover = ({ currentImage, config, onUploadStart, onUploadComplete, isGenerating }: MagazineCoverProps) => {
    
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadStart();
            setTimeout(() => {
                onUploadComplete(AI_GENERATED_RESULT);
            }, 3000);
        }
    };

    return (
        <div className="w-full relative z-10 px-4 pt-4 pb-8" id="magazine-cover-anchor">
            {/* Magazine Title Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[120px] font-serif font-black text-white/5 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none">
                {config.title}
            </div>

            <div className="relative w-full aspect-[3/4] max-w-md mx-auto bg-slate-900 shadow-2xl overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none z-0" />

                {/* Main Image */}
                <motion.div className="relative z-10 w-full h-full overflow-hidden">
                    <motion.img 
                        key={currentImage}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        src={currentImage}
                        className={clsx("w-full h-full object-cover transition-all duration-700", isGenerating && "blur-xl opacity-60 scale-105")}
                    />
                    
                    {/* Magazine Text Overlays */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                        
                        {/* Header Text */}
                        <div className="flex justify-between items-start">
                            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase inline-block">
                                Special Issue
                            </div>
                            <div className="text-right">
                                <span className="block text-[40px] font-serif leading-none text-white mix-blend-overlay opacity-80">{config.issueDate}</span>
                                <span className="block text-[10px] tracking-[0.2em] text-white/80">VOL.04</span>
                            </div>
                        </div>

                        {/* Vertical Japanese Text (Left) */}
                        <div className="absolute top-20 left-4 md:left-6 [writing-mode:vertical-rl] text-white drop-shadow-lg space-y-4">
                            <p className="text-2xl font-serif font-bold tracking-widest text-amber-400 whitespace-pre-wrap leading-relaxed">
                                {config.verticalText}
                            </p>
                            <p className="text-xs tracking-widest opacity-80 border-r border-white/40 pr-2 my-4">
                                今週のミューズ
                            </p>
                        </div>

                        {/* Catchphrase (Right/Bottom) */}
                        <div className="text-right space-y-1 pb-10">
                            <h2 className="text-3xl md:text-4xl font-serif text-white font-bold italic drop-shadow-lg">
                                <span className="text-amber-400 block text-sm font-sans not-italic font-normal mb-1 tracking-widest uppercase">{config.subHeading}</span>
                                {config.mainHeading}
                            </h2>
                            <p className="text-xs text-white/80 tracking-wider">
                                あなただけのスタイル、<br/>AIが引き出す新しい表情。
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* AI Loading Overlay */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 backdrop-blur-sm"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-amber-400/30 rounded-full animate-ping absolute inset-0" />
                                <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin relative z-10" />
                            </div>
                            <span className="mt-4 text-amber-400 font-mono text-xs uppercase animate-pulse tracking-widest">
                                AI Transforming...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Camera Button (Floating Action) */}
                <label className="absolute bottom-4 right-4 z-40 cursor-pointer group/btn">
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur border border-white/20 rounded-full pl-4 pr-1 py-1 text-white hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all shadow-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wide mr-1">AI Scan</span>
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover/btn:bg-black/20">
                            <Camera size={14} />
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
 */
interface ModelLibraryProps {
    onSelect: (url: string) => void;
    activeUrl: string;
}

const ModelLibrary = ({ onSelect, activeUrl }: ModelLibraryProps) => {
    return (
        <div className="mb-10 pl-6">
            <div className="flex items-center gap-2 mb-3 opacity-70">
                <LayoutGrid size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Model Library</span>
            </div>
            
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 pr-6 min-w-max">
                    <button className="w-16 h-20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 hover:bg-white/5 hover:text-amber-400 transition-colors gap-1 shrink-0">
                        <Upload size={16} />
                        <span className="text-[8px] font-bold uppercase">Upload</span>
                    </button>
                    {MODEL_LIBRARY.map((model) => (
                        <motion.button
                            key={model.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(model.url)}
                            className={clsx(
                                "relative w-16 h-20 rounded-lg overflow-hidden border transition-all shrink-0 group",
                                activeUrl === model.url 
                                    ? "border-amber-400 ring-2 ring-amber-400/30 scale-105" 
                                    : "border-white/10 opacity-60 hover:opacity-100"
                            )}
                        >
                            <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                            {activeUrl === model.url && (
                                <div className="absolute inset-0 bg-amber-500/20" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * 3. Daily Interview
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
                setHistory(prev => [...prev, { type: 'ai', text: "Thank you. Good take." }]);
            }, 800);
        }
    };

    useEffect(() => {
        if(isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isOpen]);

    return (
        <div className="px-6 mb-8 flex justify-center">
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="w-full max-w-sm bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-amber-500/30 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500">
                        <MessageCircle size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Daily Interview</span>
                        <span className="text-sm text-white font-serif italic">Start Session</span>
                    </div>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-[#0b0c10] flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Interview Session</span>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {history.map((msg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={clsx("flex w-full", msg.type === 'user' ? "justify-end" : "justify-start")}
                                >
                                    <div className={clsx(
                                        "max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
                                        msg.type === 'user' 
                                            ? "bg-amber-900/40 text-amber-100 border border-amber-500/20 rounded-tr-none" 
                                            : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none"
                                    )}>
                                        {msg.type === 'ai' && <p className="text-[9px] text-slate-500 mb-1 font-bold uppercase">Editor AI</p>}
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur pb-8">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 pr-12 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    autoFocus
                                />
                                <button 
                                    onClick={handleSend}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors disabled:opacity-50"
                                    disabled={!inputValue.trim()}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 4. Magazine Editor (New Component)
 */
interface MagazineEditorProps {
    config: MagazineConfig;
    setConfig: React.Dispatch<React.SetStateAction<MagazineConfig>>;
}

const MagazineEditor = ({ config, setConfig }: MagazineEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);

    // 編集モードに入ったら上部へスクロール（プレビューを見やすくする）
    useEffect(() => {
        if (isEditing) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isEditing]);

    return (
        <div className="px-6 mb-32 flex justify-center">
            {/* Trigger Button */}
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="w-full max-w-sm bg-slate-900/50 border border-white/10 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors group"
            >
                <Edit3 size={14} className="text-slate-400 group-hover:text-amber-400" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">
                    雑誌を編集する
                </span>
            </motion.button>

            {/* Editor Panel (Bottom Sheet) */}
            <AnimatePresence>
                {isEditing && (
                    <>
                        {/* Overlay to darken background slightly */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[55]"
                            onClick={() => setIsEditing(false)}
                        />
                        
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#111] border-t border-white/10 rounded-t-2xl shadow-2xl h-[50vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-3 border-b border-white/10 flex justify-between items-center bg-slate-900/80 rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <Type size={14} className="text-amber-500" />
                                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Text Editor</span>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-amber-500/30 transition-colors"
                                >
                                    <Check size={12} /> COMPLETE
                                </button>
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-10">
                                
                                {/* 1. Title */}
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Magazine Title</label>
                                    <input 
                                        type="text" 
                                        value={config.title}
                                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>

                                {/* 2. Main Heading & Sub */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Main Heading</label>
                                        <input 
                                            type="text" 
                                            value={config.mainHeading}
                                            onChange={(e) => setConfig({ ...config, mainHeading: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Sub Heading</label>
                                        <input 
                                            type="text" 
                                            value={config.subHeading}
                                            onChange={(e) => setConfig({ ...config, subHeading: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>

                                {/* 3. Vertical Text (Japanese) */}
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <AlignVerticalJustifyCenter size={10} /> Vertical Text (Japanese)
                                    </label>
                                    <textarea 
                                        value={config.verticalText}
                                        onChange={(e) => setConfig({ ...config, verticalText: e.target.value })}
                                        rows={3}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                                        placeholder="Use Enter key for new lines"
                                    />
                                    <p className="text-[9px] text-slate-600 mt-1">* 改行すると縦書きの列が変わります</p>
                                </div>

                                {/* 4. Issue Date */}
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Issue Date</label>
                                    <input 
                                        type="text" 
                                        value={config.issueDate}
                                        onChange={(e) => setConfig({ ...config, issueDate: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>

                            </div>
                        </motion.div>
                    </>
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
        <div className="min-h-screen bg-[#0b0c10] text-slate-200 font-sans selection:bg-amber-500/30 pb-10 relative overflow-hidden">
        
        <AmbientParticles />

        {/* Header Info */}
        <div className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                <span className="text-[9px] font-mono font-bold text-slate-200 uppercase tracking-widest">ON AIR</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold border border-white/10 px-2 py-1 rounded bg-black/20">WEEK 04</span>
        </div>

        <main className="relative pt-12 max-w-lg mx-auto">
            {/* 1. Magazine Cover (Featured Model) & AI Gen */}
            <MagazineCover 
                currentImage={currentModelImage}
                config={magazineConfig}
                isGenerating={isGenerating}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
            />

            {/* 2. Model Library Selector */}
            <ModelLibrary 
                activeUrl={currentModelImage}
                onSelect={(url) => setCurrentModelImage(url)}
            />

            {/* 3. Daily Interview */}
            <DailyInterview />

            {/* 4. Magazine Editor */}
            <MagazineEditor 
                config={magazineConfig}
                setConfig={setMagazineConfig}
            />
        </main>

        </div>
    );
}