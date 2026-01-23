"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clapperboard, 
  PenTool, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Layout, 
  RefreshCw,
  Quote,
  Activity,
  X,
  Printer
} from "lucide-react";
import clsx from "clsx";

// --- Assets & Utilities ---

const PaperTexture = () => (
    <div 
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] mix-blend-multiply"
      style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
      }}
    />
);

// --- Types & Mock Data ---

type WeeklyLog = {
  id: number;
  day: string;
  img: string;
  caption: string;
  fullText: string;
};

const WEEKLY_LOGS: WeeklyLog[] = [
  { id: 1, day: "MON", img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&q=80", caption: "霧の中の静寂", fullText: "月曜日の朝。まだ誰もいないオフィスで、コーヒーの湯気だけが揺れていた。" },
  { id: 2, day: "TUE", img: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&q=80", caption: "都市のリズム", fullText: "信号機の点滅、クラクションの音。都市のリズムに急かされるように歩く。" },
  { id: 3, day: "WED", img: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?w=400&q=80", caption: "珈琲の香り", fullText: "週の半ば。少し立ち止まって深呼吸をする。豆を挽く音が心地よい。" },
  { id: 4, day: "THU", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80", caption: "空白の美学", fullText: "何も思い浮かばない日があってもいい。白いノートをそのまま閉じた。" },
  { id: 5, day: "FRI", img: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&q=80", caption: "夜の逃避行", fullText: "「逃げたい」と漏らした夜。街灯の下をあてもなく歩き続けた。" },
  { id: 6, day: "SAT", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", caption: "自分への回帰", fullText: "好きな音楽だけを聴く一日。少しずつ色が戻ってくる感覚。" },
  { id: 7, day: "SUN", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80", caption: "エピローグ", fullText: "明日からの予感。静かに幕を下ろす日曜日。" },
];

const AI_TITLE_SUGGESTIONS = [
  "雨のち、微かな光",
  "沈黙の木曜日",
  "Blue Period, Red Signals"
];

const AI_EDITORIAL_REVIEW = `今週のあなたは、目標だった運動こそ完璧ではありませんでしたが、その葛藤の中に『自分を諦めない強さ』が写っていました。特に木曜日の夜に吐露した「逃げたい」という言葉。それは物語において、最も美しい転換点でした。逃げることもまた、主演が選んだ気高い決断です。`;

const MODEL_IMAGES = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80"
];

// --- Components ---

/**
 * 1. Weekly Rush (Contact Sheet Style)
 */
const WeeklyRush = ({ onSelectLog }: { onSelectLog: (log: WeeklyLog) => void }) => {
  return (
    <div className="w-full bg-stone-100 py-8 overflow-hidden border-y border-stone-200 shadow-inner">
      <div className="flex gap-6 overflow-x-auto no-scrollbar px-8 snap-x">
        {WEEKLY_LOGS.map((log) => (
          <motion.button 
            key={log.id} 
            onClick={() => onSelectLog(log)}
            className="snap-center shrink-0 w-44 bg-white p-1.5 shadow-md border border-stone-200 group cursor-pointer transition-all focus:outline-none"
            whileHover={{ y: -4, rotate: (log.id % 2 === 0 ? 1 : -1) }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                <img src={log.img} className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt={log.day} />
                <div className="absolute top-1 left-1 bg-black/60 text-white px-1 font-mono text-[8px] tracking-wider">
                    {log.day}
                </div>
            </div>
            <div className="p-2 pt-3 text-left">
                <p className="text-[10px] text-stone-600 font-serif tracking-wide leading-tight group-hover:text-red-700 transition-colors">{log.caption}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/**
 * Log Detail Modal
 */
const LogDetailModal = ({ log, onClose }: { log: WeeklyLog | null, onClose: () => void }) => (
    <AnimatePresence>
        {log && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-50/90 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative bg-white border border-stone-200 max-w-sm w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                    <div className="aspect-[4/3] relative">
                        <img src={log.img} className="w-full h-full object-cover filter contrast-[1.05]" />
                        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-red-700 transition-colors"><X size={16} /></button>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">{log.day}</span>
                            <div className="h-px bg-stone-200 flex-1" />
                        </div>
                        <h3 className="font-serif text-xl text-stone-900 mb-4">{log.caption}</h3>
                        <p className="text-sm text-stone-600 font-serif leading-loose">
                            {log.fullText}
                        </p>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

/**
 * 2. Editorial Note & Mood Graph
 */
const EditorialSection = () => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
      let i = 0;
      const timer = setInterval(() => {
          if (i < AI_EDITORIAL_REVIEW.length) {
              setDisplayedText((prev) => prev + AI_EDITORIAL_REVIEW.charAt(i));
              i++;
          } else {
              clearInterval(timer);
          }
      }, 30);
      return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-stone-200 p-8 relative overflow-hidden shadow-sm">
      {/* Grid Paper Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Editor's Review */}
      <div className="mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Quote size={14} className="text-red-700" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              Editorial Review
            </h3>
          </div>
          <div className="font-serif text-stone-800 leading-loose text-sm min-h-[120px] tracking-wide">
            {displayedText}
            <span className="inline-block w-1.5 h-4 bg-red-700 ml-1 animate-pulse align-middle" />
          </div>
      </div>

      {/* Weekly Mood Arc */}
      <div className="pt-6 border-t border-stone-100 relative z-10">
          <div className="flex items-center gap-2 mb-6">
              <Activity size={14} className="text-stone-400" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Emotional Arc</h4>
          </div>
          <div className="h-28 w-full relative pl-2">
              <div className="absolute inset-0 flex flex-col justify-between opacity-30">
                  <div className="border-t border-dashed border-stone-300 w-full" />
                  <div className="border-t border-dashed border-stone-300 w-full" />
                  <div className="border-t border-dashed border-stone-300 w-full" />
              </div>
              
              <svg className="w-full h-full overflow-visible">
                  <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                      </linearGradient>
                  </defs>
                  <path d="M0,80 C20,80 40,40 60,50 S100,20 140,30 S180,90 220,60 S260,40 300,50" fill="url(#gradient)" stroke="none" />
                  <motion.path 
                      d="M0,80 C20,80 40,40 60,50 S100,20 140,30 S180,90 220,60 S260,40 300,50" 
                      fill="none" 
                      stroke="#b91c1c" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  {[
                      {x: "20%", y: "50%", label: "TUE"},
                      {x: "46%", y: "30%", label: "THU"},
                      {x: "73%", y: "60%", label: "SAT"}
                  ].map((p, i) => (
                      <g key={i}>
                          <circle cx={p.x} cy={p.y} r="3" fill="#fafaf9" stroke="#b91c1c" strokeWidth="2" />
                          <text x={p.x} y="105%" textAnchor="middle" className="text-[8px] fill-stone-400 font-mono tracking-widest">{p.label}</text>
                      </g>
                  ))}
              </svg>
          </div>
      </div>
    </div>
  );
};

/**
 * 3-A. Title Selector
 */
const TitleSelector = ({ selectedTitle, onSelect }: { selectedTitle: string; onSelect: (t: string) => void; }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 border-b border-stone-200 pb-2 flex items-center gap-2">
                <PenTool size={14} className="text-red-700" /> Title Candidates
            </h3>
            <div className="grid gap-3">
                {AI_TITLE_SUGGESTIONS.map((title) => (
                    <button 
                        key={title} 
                        onClick={() => onSelect(title)} 
                        className={clsx(
                            "w-full text-left px-5 py-4 border transition-all font-serif group flex items-center justify-between", 
                            selectedTitle === title 
                                ? "bg-white border-red-700 shadow-sm text-stone-900" 
                                : "bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900"
                        )}
                    >
                        <span className="text-lg italic tracking-wide">{title}</span>
                        {selectedTitle === title && <Check size={16} className="text-red-700" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

/**
 * 3-B. Cover Choice
 */
const CoverChoice = ({ selectedType, onSelect, finalTitle }: { selectedType: 'star' | 'montage'; onSelect: (type: 'star' | 'montage') => void; finalTitle: string; }) => {
    const [modelIndex, setModelIndex] = useState(0);

    const handleSwapModel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModelIndex((prev) => (prev + 1) % MODEL_IMAGES.length);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 border-b border-stone-200 pb-2 flex items-center gap-2">
                <Layout size={14} className="text-red-700" /> Cover Design
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
                {/* Option A: Star Cover */}
                <div 
                    onClick={() => onSelect('star')}
                    className={clsx(
                        "relative aspect-[3/4] bg-white p-1.5 shadow-md border cursor-pointer transition-all group",
                        selectedType === 'star' ? "border-red-700 ring-2 ring-red-700/20 scale-[1.02]" : "border-stone-200 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                    )}
                >
                    <div className="relative w-full h-full overflow-hidden bg-stone-100">
                        <img src={MODEL_IMAGES[modelIndex]} className="absolute inset-0 w-full h-full object-cover filter contrast-[1.05]" alt="Star" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                        
                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                            <span className="text-[8px] font-bold uppercase tracking-widest mb-1.5 bg-red-700 text-white px-1.5 py-0.5 w-fit">Concept</span>
                            <h4 className="font-serif text-lg leading-tight drop-shadow-md">{finalTitle}</h4>
                        </div>

                        <button 
                            onClick={handleSwapModel}
                            className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-700 transition-colors z-20"
                            title="Change Cast"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>

                {/* Option B: Montage Cover */}
                <div 
                    onClick={() => onSelect('montage')}
                    className={clsx(
                        "relative aspect-[3/4] bg-white p-1.5 shadow-md border cursor-pointer transition-all group",
                        selectedType === 'montage' ? "border-red-700 ring-2 ring-red-700/20 scale-[1.02]" : "border-stone-200 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                    )}
                >
                    <div className="relative w-full h-full overflow-hidden bg-stone-900">
                        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-80 mix-blend-screen">
                            <img src={WEEKLY_LOGS[0].img} className="w-full h-full object-cover" />
                            <img src={WEEKLY_LOGS[2].img} className="w-full h-full object-cover" />
                            <img src={WEEKLY_LOGS[4].img} className="w-full h-full object-cover" />
                            <img src={WEEKLY_LOGS[6].img} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                            <span className="text-[8px] font-bold uppercase tracking-widest mb-1.5 bg-white text-stone-900 px-1.5 py-0.5 w-fit shadow-sm">Real</span>
                            <h4 className="font-serif text-lg leading-tight">{finalTitle}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * 4. Publishing Ceremony Overlay
 */
const PublishingOverlay = ({ isVisible }: { isVisible: boolean }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if(isVisible) {
            const t1 = setTimeout(() => setStep(1), 1000); // Printing
            const t2 = setTimeout(() => setStep(2), 2500); // Binding
            const t3 = setTimeout(() => setStep(3), 4000); // Wax Seal
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-stone-50/95 backdrop-blur-md flex items-center justify-center text-stone-800">
            <div className="text-center space-y-8">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="init" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <Printer size={40} className="mx-auto mb-4 animate-pulse text-red-700" />
                            <h2 className="text-sm font-mono tracking-[0.3em] text-stone-400">PREPARING TO PRINT...</h2>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div key="dev" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                            <h2 className="text-3xl font-serif italic text-stone-800">Developing Story...</h2>
                            <div className="w-64 h-0.5 bg-stone-200 mt-6 mx-auto">
                                <motion.div className="h-full bg-red-700" initial={{width:0}} animate={{width:"100%"}} transition={{duration:1.5}} />
                            </div>
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div key="bind" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}}>
                            <h2 className="text-3xl font-serif italic text-stone-800">Binding Memories...</h2>
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div key="seal" initial={{opacity:0, scale:2}} animate={{opacity:1, scale:1}} transition={{type:"spring", bounce:0.5}}>
                            {/* Sealing Wax Stamp Effect */}
                            <div className="w-32 h-32 bg-red-800 rounded-full flex items-center justify-center mx-auto shadow-[0_10px_30px_rgba(185,28,28,0.5)] border-4 border-red-900 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                                <span className="font-serif font-bold text-4xl text-red-200 tracking-widest drop-shadow-sm">LP</span>
                            </div>
                            <p className="mt-8 text-xs font-bold tracking-[0.4em] uppercase text-stone-400">Issue Published</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function FinalCutPage() {
  const [selectedTitle, setSelectedTitle] = useState(AI_TITLE_SUGGESTIONS[0]);
  const [coverType, setCoverType] = useState<'star' | 'montage'>('star');
  const [selectedLog, setSelectedLog] = useState<WeeklyLog | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
      setIsPublishing(true);
      setTimeout(() => {
          console.log("Navigation Triggered");
      }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans pb-32">
      <PaperTexture />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#fafaf9]/90 backdrop-blur-md border-b border-stone-200 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Clapperboard size={18} className="text-red-700" />
            <span className="font-bold tracking-[0.2em] uppercase text-xs">The Final Cut</span>
        </div>
        <span className="font-mono text-[9px] text-stone-400 tracking-widest uppercase">Editing Room</span>
      </header>

      {/* 1. Weekly Rush */}
      <div className="pt-20 pb-4">
          <WeeklyRush onSelectLog={setSelectedLog} />
          <p className="text-center text-[9px] text-stone-400 mt-4 uppercase tracking-[0.3em] font-serif italic">
              Tap frame to inspect
          </p>
      </div>

      <main className="max-w-2xl mx-auto px-6 space-y-16 mt-8 relative z-10">
        
        {/* 2. Editorial Review & Mood Graph */}
        <section>
            <EditorialSection />
        </section>

        {/* 3. Final Adjustments */}
        <section className="space-y-10">
            <div className="text-center border-b border-stone-200 pb-6">
                <h2 className="font-serif text-3xl font-bold mb-3 text-stone-900">Issue Wrap-up</h2>
                <p className="text-sm text-stone-500 font-serif leading-relaxed italic">
                    1週間の物語を閉じる時が来ました。<br/>今の心境に最も近いタイトルと、表紙を選んでください。
                </p>
            </div>

            <TitleSelector 
                selectedTitle={selectedTitle} 
                onSelect={setSelectedTitle} 
            />

            <CoverChoice 
                selectedType={coverType} 
                onSelect={setCoverType}
                finalTitle={selectedTitle || "Untitled"}
            />
        </section>

      </main>

      {/* Log Modal */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />

      {/* Publishing Animation Overlay */}
      <PublishingOverlay isVisible={isPublishing} />

      {/* 4. Publish Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 px-6 py-4 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
              <div className="text-xs">
                  <span className="block font-bold text-stone-900 tracking-wide">ISSUE 04</span>
                  <span className="text-stone-400 font-serif italic">Ready to print</span>
              </div>
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 max-w-sm bg-stone-900 text-white text-xs font-bold tracking-[0.3em] py-5 shadow-xl hover:bg-red-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-stone-900"
              >
                  <span>PUBLISH ISSUE</span>
                  <ChevronRight size={14} />
              </button>
          </div>
      </div>

    </div>
  );
}