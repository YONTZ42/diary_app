"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clapperboard, 
  Mic, 
  Layers,
  Sparkles,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Hash,
  Camera // MagazineCoverで使用
} from "lucide-react";
import clsx from "clsx";

// --- Assets & Utilities ---
const NoiseTexture = () => (
  <div 
    className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
    style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }}
  />
);

// --- Types for Magazine ---
interface MagazineConfig {
    title: string;
    verticalText: string;
    mainHeading: string;
    subHeading: string;
    issueDate: string;
}

const DEFAULT_MAGAZINE_CONFIG: MagazineConfig = {
    title: "VOGUE",
    verticalText: "私という\n現象。",
    mainHeading: "Be the Star.",
    subHeading: "Feature Model",
    issueDate: "AUG"
};

const AI_GENERATED_RESULT = "https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?w=800&q=80";

// --- Mock Data ---
const SCENE_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=800&q=80", 
];

const PAST_SCENES = [
    { 
        id: 1, take: "01", date: "MON 16", 
        img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&q=80",
        text: "霧が晴れていく瞬間。誰にも邪魔されない時間。",
        fullText: "朝早く目が覚めた。窓の外を見ると、街全体が薄い霧に包まれていた。コーヒーを淹れて、その白さが徐々に透明になっていく様をただ眺めていた。何もしない時間の贅沢さ。",
        qa: { q: "何を感じましたか？", a: "静寂と、少しの寂しさ。" },
        sentiment: 30
    },
    { 
        id: 2, take: "02", date: "TUE 17", 
        img: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&q=80",
        text: "交差点の信号が変わる音。急ぐ人々の足音。",
        fullText: "久しぶりにオフィスへ向かう。交差点の電子音、アスファルトを叩く革靴の音。都市のリズムに自分が同期していく感覚がある。",
        qa: { q: "色は？", a: "グレーのアスファルトと、信号の赤。" },
        sentiment: 60
    },
    { 
        id: 3, take: "03", date: "WED 18", 
        img: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?w=400&q=80",
        text: "午後の光が差し込むカフェで思考を整理する。",
        fullText: "いつものカフェの窓際の席。午後3時の光がテーブルに落ちる角度が好きだ。ノートを開いて、今週考えていたことを書き出してみる。",
        qa: { q: "味は？", a: "深煎りの苦味。" },
        sentiment: 45
    },
];

// --- Components ---

/**
 * 1. Magazine Cover (Replaces RoughBoard)
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
            // Simulate AI Processing
            setTimeout(() => {
                onUploadComplete(AI_GENERATED_RESULT);
            }, 3000);
        }
    };

    return (
        <div className="w-full relative z-10 pt-4 pb-8">
            {/* Magazine Title Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[100px] font-serif font-black text-white/5 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none">
                {config.title}
            </div>

            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-slate-900 shadow-2xl overflow-hidden group border border-white/5 rounded-sm">
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none z-0" />

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
                            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase inline-block shadow-lg">
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

const StatusStrip = ({ current, total }: { current: number, total: number }) => {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-end font-mono text-xs text-slate-400">
                <div className="flex gap-4">
                    <div className="flex flex-col"><span className="text-[9px] uppercase tracking-widest opacity-50">Take</span><span className="text-white font-bold text-lg">0{current}</span></div>
                    <div className="flex flex-col"><span className="text-[9px] uppercase tracking-widest opacity-50">Total</span><span className="text-slate-500 text-lg">0{total}</span></div>
                </div>
                <div className="text-right"><span className="text-amber-400 font-bold tracking-tight animate-pulse text-[10px]">3 days to Wrap</span></div>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-sm overflow-hidden flex gap-0.5">
                {Array.from({ length: total }).map((_, i) => (<div key={i} className={clsx("flex-1 h-full transition-all duration-500", i < current ? "bg-amber-400" : "bg-slate-700")} />))}
            </div>
        </div>
    );
};

const SceneLog = ({ onSelectScene }: { onSelectScene: (id: number) => void }) => {
    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Layers size={12} className="text-slate-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Filmed Scenes</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-4 -mx-6 px-6">
                {PAST_SCENES.map((scene) => (
                    <div 
                        key={scene.id} 
                        onClick={() => onSelectScene(scene.id)}
                        className="snap-start shrink-0 w-40 flex flex-col gap-2 group cursor-pointer"
                    >
                        <div className="relative aspect-video bg-slate-800 rounded-sm overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                            <img src={scene.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                            <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[8px] font-mono text-white">Take {scene.take}</div>
                        </div>
                        
                        <div className="space-y-1.5 px-0.5">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[9px] font-bold text-slate-300">{scene.date}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 font-serif">"{scene.text}"</p>
                        </div>
                    </div>
                ))}
                
                {[5, 6, 7].map((num) => (
                    <div key={num} className="snap-start shrink-0 w-40 aspect-video bg-slate-900/50 border border-dashed border-white/5 rounded-sm flex items-center justify-center">
                        <span className="text-[9px] font-mono text-slate-700 uppercase">Scene 0{num}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditorNote = () => {
    return (
        <div className="bg-slate-800/40 border-l-2 border-amber-400/50 pl-4 py-2 pr-2 rounded-r-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-slate-500" />
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Observation Log</span>
            </div>
            <p className="text-xs text-slate-300 font-serif leading-relaxed opacity-90">
                今日のあなたは、少し静かなトーンですね。その静寂が、物語に不思議な深みを与えています。
            </p>
        </div>
    );
};

/**
 * Analytics Dashboard (Script Analysis)
 */
const AnalyticsDashboard = () => {
    return (
        <div className="w-full bg-slate-900 border border-white/10 rounded-sm p-5 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <Activity size={14} className="text-amber-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Script Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
                
                {/* 1. Sentiment Arc */}
                <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">Sentiment Arc</span>
                    <div className="h-16 flex items-end gap-1 relative">
                        {/* Lines */}
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/10" />
                        <svg className="w-full h-full overflow-visible">
                            <path 
                                d="M0,50 Q25,20 50,40 T100,10" 
                                fill="none" 
                                stroke="#fbbf24" 
                                strokeWidth="2" 
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                            />
                             {/* Points */}
                             {[0, 25, 50, 75, 100].map((x, i) => (
                                 <circle key={i} cx={`${x}%`} cy={i % 2 === 0 ? "40%" : "20%"} r="3" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
                             ))}
                        </svg>
                    </div>
                </div>

                {/* 2. Key Motifs */}
                <div>
                     <div className="flex items-center gap-1.5 mb-2">
                        <Hash size={12} className="text-slate-500" />
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Motifs</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {["Silence", "Light", "City"].map(tag => (
                             <span key={tag} className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">
                                 {tag}
                             </span>
                         ))}
                     </div>
                </div>

                {/* 3. Text Volume */}
                <div>
                     <div className="flex items-center gap-1.5 mb-2">
                        <BarChart3 size={12} className="text-slate-500" />
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Voice Vol.</span>
                     </div>
                     <div className="space-y-1">
                         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full w-[70%] bg-slate-500" />
                         </div>
                         <div className="flex justify-between text-[8px] font-mono text-slate-500">
                             <span>Day 1</span>
                             <span>Day 3</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const ControlDeck = () => {
    return (
        <div className="fixed bottom-6 left-6 right-6 z-50">
            <div className="grid grid-cols-[1fr_auto] gap-3">
                <button className="group relative overflow-hidden bg-white text-slate-900 rounded-sm p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]" onClick={() => console.log("Start Interview")}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                    <div className="flex items-center justify-between px-2">
                        <div className="text-left"><span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">Action</span><h3 className="text-sm font-bold tracking-wide flex items-center gap-2">START TODAY'S TAKE</h3></div>
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors"><Mic size={14} /></div>
                    </div>
                </button>
                <button className="aspect-square h-full bg-slate-800/90 backdrop-blur border border-white/10 rounded-sm flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg">
                    <Layers size={20} /><span className="text-[8px] uppercase tracking-widest mt-1">List</span>
                </button>
            </div>
        </div>
    );
};

/**
 * Scene Detail Modal
 */
const SceneDetailModal = ({ 
    scene, 
    isOpen, 
    onClose,
    onNext,
    onPrev,
    direction
}: { 
    scene: typeof PAST_SCENES[0] | null; 
    isOpen: boolean; 
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    direction: number;
}) => {
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <AnimatePresence>
            {isOpen && scene && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <div className="relative w-full max-w-sm z-10 h-[500px] flex items-center">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div 
                                key={scene.id}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.4}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = offset.x;
                                    if (swipe < -50) {
                                        onNext();
                                    } else if (swipe > 50) {
                                        onPrev();
                                    }
                                }}
                                className="absolute inset-0 w-full bg-slate-900 rounded-lg overflow-hidden border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header Image */}
                                <div className="relative h-[45%]">
                                     <img src={scene.img} className="w-full h-full object-cover" alt="" />
                                     <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start">
                                         <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-white border border-white/20">
                                             SCENE {scene.take}
                                         </div>
                                         <button onClick={onClose} className="p-1 rounded-full bg-black/50 text-white/70 hover:text-white pointer-events-auto">
                                             <X size={20} />
                                         </button>
                                     </div>
                                     {/* Drag Hint */}
                                     <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none opacity-20">
                                         <ChevronLeft /> <ChevronRight />
                                     </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6 h-[55%] overflow-y-auto">
                                    <div>
                                        <h3 className="text-2xl font-serif text-white mb-2">{scene.date}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed font-serif">
                                            {scene.fullText}
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                            <MessageSquare size={12} /> Director's Q&A
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <p className="text-slate-500">Q. {scene.qa.q}</p>
                                            <p className="text-white">A. "{scene.qa.a}"</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 pointer-events-none opacity-0 md:opacity-100">
                         <button onClick={onPrev} className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors pointer-events-auto"><ChevronLeft size={24} /></button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 pointer-events-none opacity-0 md:opacity-100">
                         <button onClick={onNext} className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors pointer-events-auto"><ChevronRight size={24} /></button>
                    </div>

                </div>
            )}
        </AnimatePresence>
    );
};

// --- Main Page (The Studio) ---

export default function StudioPage() {
  // Magazine States
  const [currentCoverImage, setCurrentCoverImage] = useState(SCENE_IMAGES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [magazineConfig] = useState<MagazineConfig>(DEFAULT_MAGAZINE_CONFIG);

  // Existing States
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const selectedScene = PAST_SCENES.find(s => s.id === selectedSceneId) || null;
  
  const handleNext = () => {
      if(!selectedSceneId) return;
      setDirection(1);
      const idx = PAST_SCENES.findIndex(s => s.id === selectedSceneId);
      const nextIdx = (idx + 1) % PAST_SCENES.length;
      setSelectedSceneId(PAST_SCENES[nextIdx].id);
  };
  
  const handlePrev = () => {
      if(!selectedSceneId) return;
      setDirection(-1);
      const idx = PAST_SCENES.findIndex(s => s.id === selectedSceneId);
      const prevIdx = (idx - 1 + PAST_SCENES.length) % PAST_SCENES.length;
      setSelectedSceneId(PAST_SCENES[prevIdx].id);
  };

  const handleUploadStart = () => {
      setIsGenerating(true);
  };

  const handleUploadComplete = (newUrl: string) => {
      setCurrentCoverImage(newUrl);
      setIsGenerating(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f17] text-slate-100 font-sans selection:bg-amber-400/30">
      <NoiseTexture />
      
      <header className="px-6 pt-8 pb-4 flex justify-between items-end relative z-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
               <Clapperboard size={14} className="text-amber-400" />
               <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.2em]">Production Studio</span>
           </div>
           <h1 className="font-serif text-2xl text-white tracking-wide">The Documentary</h1>
        </div>
        <div className="font-mono text-[9px] text-slate-500 text-right"><div>WEEK 42</div><div>ISSUE 04</div></div>
      </header>

      <main className="px-6 pb-32 relative z-10 flex flex-col gap-8">
        
        <section className="space-y-4">
            {/* Replaced RoughBoard with MagazineCover */}
            <MagazineCover 
                currentImage={currentCoverImage}
                config={magazineConfig}
                isGenerating={isGenerating}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
            />
            <StatusStrip current={4} total={7} />
        </section>

        <section>
            <SceneLog onSelectScene={(id) => { setDirection(0); setSelectedSceneId(id); }} />
        </section>

        <section className="space-y-4">
            <EditorNote />
            <AnalyticsDashboard />
        </section>

        <SceneDetailModal 
            scene={selectedScene} 
            isOpen={!!selectedSceneId} 
            onClose={() => setSelectedSceneId(null)} 
            onNext={handleNext}
            onPrev={handlePrev}
            direction={direction}
        />

        {/* <ControlDeck /> */}

      </main>
    </div>
  );
}