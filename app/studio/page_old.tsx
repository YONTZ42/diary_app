"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clapperboard, 
  Layers,
  Sparkles,
  Camera,
  PenTool,
  Activity,
  BarChart3,
  Hash
} from "lucide-react";
import clsx from "clsx";
import { DailyLogViewer } from "../_components/daily_log_viewer"; // Import DailyLogViewer

// --- Assets & Utilities ---
const PaperTexture = () => (
  <div 
    className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] mix-blend-multiply"
    style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
    }}
  />
);

// --- Types ---
interface MagazineConfig {
    title: string;
    verticalText: string;
    mainHeading: string;
    subHeading: string;
    issueDate: string;
}

// Convert mock data to Article type for DailyLogViewer
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

const DEFAULT_MAGAZINE_CONFIG: MagazineConfig = {
    title: "CINEMA",
    verticalText: "記録という\n永遠。",
    mainHeading: "The Documentary",
    subHeading: "Life as Cinema",
    issueDate: "OCT"
};

// --- Mock Data ---
const SCENE_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
];

// Mock Data transformed to match Article type
const PAST_SCENES_DATA: Article[] = [
    { 
        id: "1", 
        date: 16, 
        imageUrl: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80",
        title: "霧が晴れていく瞬間",
        content: "朝早く目が覚めた。窓の外を見ると、街全体が薄い霧に包まれていた。コーヒーを淹れて、その白さが徐々に透明になっていく様をただ眺めていた。何もしない時間の贅沢さ。\n\nQ. 何を感じましたか？\nA. 静寂と、少しの寂しさ。",
        color: "#d6d3d1",
        rating: 30
    },
    { 
        id: "2", 
        date: 17, 
        imageUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80",
        title: "都市のリズム",
        content: "久しぶりにオフィスへ向かう。交差点の電子音、アスファルトを叩く革靴の音。都市のリズムに自分が同期していく感覚がある。\n\nQ. 色は？\nA. グレーのアスファルトと、信号の赤。",
        color: "#ef4444",
        rating: 60
    },
    { 
        id: "3", 
        date: 18, 
        imageUrl: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?w=800&q=80",
        title: "午後の光",
        content: "いつものカフェの窓際の席。午後3時の光がテーブルに落ちる角度が好きだ。ノートを開いて、今週考えていたことを書き出してみる。\n\nQ. 味は？\nA. 深煎りの苦味。",
        color: "#78350f",
        rating: 45
    },
];

// --- Components ---

/**
 * 1. Magazine Cover (Studio Poster Style)
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
        <div className="w-full relative z-10 pt-4 pb-8">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[100px] font-serif font-black text-stone-900/5 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none">
                {config.title}
            </div>

            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-white p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:scale-[1.01]">
                <div className="relative w-full h-full overflow-hidden bg-stone-100">
                    <motion.img 
                        key={currentImage}
                        initial={{ scale: 1.1, opacity: 0, filter: "blur(10px) grayscale(100%)" }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px) grayscale(0%)" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        src={currentImage}
                        className={clsx("w-full h-full object-cover transition-all duration-700 filter contrast-[1.1]", isGenerating && "blur-xl opacity-60 scale-105")}
                    />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="bg-red-700 text-white text-[9px] font-bold px-3 py-1 tracking-[0.2em] uppercase shadow-md">
                                Now Printing
                            </div>
                            <div className="text-right">
                                <span className="block text-[40px] font-serif leading-none text-white drop-shadow-md opacity-90">{config.issueDate}</span>
                                <span className="block text-[9px] tracking-[0.3em] text-white/90 drop-shadow-sm">CUT.04</span>
                            </div>
                        </div>

                        <div className="absolute top-24 left-6 [writing-mode:vertical-rl] text-white drop-shadow-lg space-y-4">
                            <p className="text-2xl font-serif font-bold tracking-widest text-white whitespace-pre-wrap leading-relaxed drop-shadow-md">
                                {config.verticalText}
                            </p>
                        </div>

                        <div className="text-right space-y-1 pb-8">
                            <h2 className="text-3xl md:text-4xl font-serif text-white font-bold italic drop-shadow-xl">
                                <span className="text-red-500 block text-xs font-sans not-italic font-bold mb-1 tracking-[0.3em] uppercase drop-shadow-sm">{config.subHeading}</span>
                                {config.mainHeading}
                            </h2>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isGenerating && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/90 z-30 backdrop-blur-sm"
                        >
                            <div className="w-12 h-12 border-2 border-stone-200 border-t-red-700 rounded-full animate-spin" />
                            <span className="mt-4 text-red-700 font-serif text-xs uppercase animate-pulse tracking-widest">
                                Developing Film...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <label className="absolute -bottom-5 right-5 z-40 cursor-pointer group/btn">
                    <div className="flex items-center gap-3 bg-stone-900 text-white pl-5 pr-2 py-2.5 shadow-xl hover:bg-red-800 transition-all hover:-translate-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest mr-1">New Scene</span>
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

const StatusStrip = ({ current, total }: { current: number, total: number }) => {
    return (
        <div className="w-full space-y-3 px-2">
            <div className="flex justify-between items-end font-serif text-xs text-stone-500">
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-0.5">Scene</span>
                        <span className="text-stone-900 font-bold text-lg leading-none">0{current}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-0.5">Total</span>
                        <span className="text-stone-400 text-lg leading-none">0{total}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-red-700 font-bold tracking-wide text-[10px] uppercase border-b border-red-700 pb-0.5">Production Active</span>
                </div>
            </div>
            <div className="h-0.5 w-full bg-stone-200 flex gap-0.5">
                {Array.from({ length: total }).map((_, i) => (
                    <div 
                        key={i} 
                        className={clsx(
                            "flex-1 h-full transition-all duration-500", 
                            i < current ? "bg-red-700" : "bg-transparent"
                        )} 
                    />
                ))}
            </div>
        </div>
    );
};

const SceneLog = ({ onSelectScene }: { onSelectScene: (id: string) => void }) => {
    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4 px-1 border-b border-stone-200 pb-2 mx-6">
                <Layers size={14} className="text-red-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Scene Archive</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-6 -mx-6 px-6">
                {PAST_SCENES_DATA.map((scene) => (
                    <div 
                        key={scene.id} 
                        onClick={() => onSelectScene(scene.id)}
                        className="snap-start shrink-0 w-44 flex flex-col gap-3 group cursor-pointer"
                    >
                        <div className="relative aspect-video bg-white p-1.5 shadow-sm group-hover:shadow-md transition-shadow border border-stone-100">
                            <div className="w-full h-full overflow-hidden bg-stone-100 relative">
                                <img src={scene.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                <div className="absolute top-0 left-0 bg-stone-900/80 px-1.5 py-0.5 text-[8px] font-mono text-white">
                                    TK-0{scene.id}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-1 px-1">
                            <span className="text-[9px] font-bold text-red-700 uppercase tracking-widest block">Day {scene.date}</span>
                            <p className="text-[10px] text-stone-500 leading-tight line-clamp-2 font-serif group-hover:text-stone-800 transition-colors">
                                "{scene.title}"
                            </p>
                        </div>
                    </div>
                ))}
                
                {[4, 5].map((num) => (
                    <div key={num} className="snap-start shrink-0 w-44 aspect-video bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center opacity-50">
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">Scene 0{num}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditorNote = () => {
    return (
        <div className="bg-white border-l-4 border-red-700 pl-5 py-4 pr-4 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-2">
                <PenTool size={12} className="text-stone-400" />
                <span className="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-bold">Director's Note</span>
            </div>
            <p className="text-sm text-stone-700 font-serif leading-relaxed italic">
                "今日のあなたは、少し静かなトーンですね。その静寂が、物語に不思議な深みを与えています。"
            </p>
        </div>
    );
};

const AnalyticsDashboard = () => {
    return (
        <div className="w-full bg-white border border-stone-200 p-6 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
                <Activity size={14} className="text-red-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Narrative Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="col-span-2">
                    <span className="text-[9px] text-stone-500 uppercase tracking-widest block mb-2 font-bold">Emotional Arc</span>
                    <div className="h-16 flex items-end gap-1 relative">
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-stone-200" />
                        <svg className="w-full h-full overflow-visible">
                            <path 
                                d="M0,50 Q25,20 50,40 T100,10" 
                                fill="none" 
                                stroke="#b91c1c" 
                                strokeWidth="1.5" 
                                className=""
                            />
                             {[0, 25, 50, 75, 100].map((x, i) => (
                                 <circle key={i} cx={`${x}%`} cy={i % 2 === 0 ? "40%" : "20%"} r="2.5" fill="#fafaf9" stroke="#b91c1c" strokeWidth="1.5" />
                             ))}
                        </svg>
                    </div>
                </div>

                <div>
                     <div className="flex items-center gap-1.5 mb-3">
                        <Hash size={12} className="text-stone-400" />
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Key Motifs</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {["Silence", "Light", "City"].map(tag => (
                             <span key={tag} className="text-[9px] font-serif text-stone-600 bg-stone-100 px-2 py-1 border border-stone-200">
                                 #{tag}
                             </span>
                         ))}
                     </div>
                </div>

                <div>
                     <div className="flex items-center gap-1.5 mb-3">
                        <BarChart3 size={12} className="text-stone-400" />
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Dialogue Vol.</span>
                     </div>
                     <div className="space-y-1">
                         <div className="w-full h-1 bg-stone-100 overflow-hidden">
                             <div className="h-full w-[70%] bg-stone-400" />
                         </div>
                         <div className="flex justify-between text-[8px] font-mono text-stone-400 pt-1">
                             <span>Day 1</span>
                             <span>Day 3</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page (The Studio) ---

export default function StudioPage() {
  const [currentCoverImage, setCurrentCoverImage] = useState(SCENE_IMAGES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [magazineConfig] = useState<MagazineConfig>(DEFAULT_MAGAZINE_CONFIG);

  const [articles, setArticles] = useState<Article[]>(PAST_SCENES_DATA);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const selectedArticle = articles.find(s => s.id === selectedArticleId) || null;
  
  const handleNext = () => {
      if(!selectedArticleId) return;
      const idx = articles.findIndex(s => s.id === selectedArticleId);
      const nextIdx = (idx + 1) % articles.length;
      setSelectedArticleId(articles[nextIdx].id);
  };
  
  const handlePrev = () => {
      if(!selectedArticleId) return;
      const idx = articles.findIndex(s => s.id === selectedArticleId);
      const prevIdx = (idx - 1 + articles.length) % articles.length;
      setSelectedArticleId(articles[prevIdx].id);
  };

  const handleUpdateArticle = (updated: Article) => {
      setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleUploadStart = () => {
      setIsGenerating(true);
  };

  const handleUploadComplete = (newUrl: string) => {
      setCurrentCoverImage(newUrl);
      setIsGenerating(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#fafaf9] text-stone-800 font-sans selection:bg-red-100 selection:text-red-900">
      <PaperTexture />
      
      <header className="px-8 pt-2 pb-6 flex justify-between items-end z-20 shrink-0">
        <div className="cursor-pointer group">
          <h1 className="font-serif text-3xl text-stone-900 tracking-wide font-medium group-hover:text-red-800 transition-colors">Life is Journal.</h1>
          <p className="text-[10px] text-red-700 uppercase tracking-[0.3em] font-bold mt-1">Archive of Days</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border border-white shadow-md hover:shadow-lg transition-all cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"/>
        </div>
      </header>

      <main className="px-6 pb-32 relative z-10 flex flex-col gap-12 max-w-lg mx-auto md:max-w-xl">
        
        <section className="space-y-6">
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
            <SceneLog onSelectScene={(id) => { setSelectedArticleId(id); }} />
        </section>

        <section className="space-y-6">
            <EditorNote />
            <AnalyticsDashboard />
        </section>

        {/* Modal: Daily Log Viewer */}
        <AnimatePresence>
            {selectedArticle && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-stone-50/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="min-h-screen flex items-center justify-center py-10"
                    >
                        <DailyLogViewer 
                            article={selectedArticle} 
                            onClose={() => setSelectedArticleId(null)} 
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onSave={handleUpdateArticle}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Decorative Footer */}
        <div className="text-center pt-8 opacity-40">
            <Sparkles size={16} className="mx-auto text-stone-400 mb-2" />
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone-500 font-serif">Life is Cinema</p>
        </div>

      </main>
    </div>
  );
}