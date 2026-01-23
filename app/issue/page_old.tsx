"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Sparkles } from "lucide-react";
import clsx from "clsx";

// --- 1. Type Definitions ---

type ThemeConfig = {
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
  articleBg: string;
};

type DiaryEntry = {
  day: string;
  date: string;
  title: string;
  mood: string;
  color: string;
  img: string;
  text: string;
};

type IssueData = {
  id: string;
  title: React.ReactNode;
  date: string;
  tag: string;
  theme: ThemeConfig;
  desc: React.ReactNode;
  cover: string;
  diaries: DiaryEntry[];
};

// --- 2. Mock Data ---

const ISSUES: IssueData[] = [
  {
    id: 'issue_03',
    title: <>Quiet<br />Ambition</>,
    date: "OCT 15 - 21",
    tag: "ACTIVE",
    theme: {
      bg: "bg-[#f0f0f0]",
      text: "text-gray-900",
      accent: "text-red-600",
      cardBg: "bg-white",
      articleBg: "bg-white/95 backdrop-blur-md"
    },
    desc: <>予兆の朝から始まった静かなる変化。<br />誰にも見せない葛藤の記録。</>,
    cover: "https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?q=80&w=600&auto=format&fit=crop",
    diaries: [
      { day: "01", date: "OCT 15", title: "予兆の朝", mood: "Melancholy", color: "bg-blue-400", img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=400&auto=format&fit=crop", text: "朝、カーテンの隙間から漏れる光に目が覚めたとき、世界はいつもより少しだけ静かに見えた。" },
      { day: "02", date: "OCT 16", title: "誰かの視線", mood: "Anxious", color: "bg-orange-400", img: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=400&auto=format&fit=crop", text: "カフェの雑踏。ノイズキャンセリングをオンにしても、背中に刺さるような焦燥感が消えない。" },
      { day: "03", date: "OCT 17", title: "書き留める", mood: "Calm", color: "bg-emerald-400", img: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?q=80&w=400&auto=format&fit=crop", text: "昨日の迷いが嘘のように、今日は言葉が溢れてくる。何も起きていない一日だったが、内面では劇的な変化が起きている。" }
    ]
  },
  {
    id: 'issue_02',
    title: <>Midnight<br />Swim</>,
    date: "SEP 20 - 26",
    tag: "COMPLETED",
    theme: {
      bg: "bg-[#0f172a]",
      text: "text-white",
      accent: "text-blue-400",
      cardBg: "bg-[#1e293b]",
      articleBg: "bg-[#1e293b]/95 backdrop-blur-md"
    },
    desc: <>深く息を吸い込む。言葉が泡のように消える世界で、<br />本当の自分の輪郭を確かめる旅。</>,
    cover: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?q=80&w=600&auto=format&fit=crop",
    diaries: [
      { day: "01", date: "SEP 20", title: "潜水", mood: "Deep", color: "bg-indigo-500", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop", text: "深く息を吸い込む。この号では、自分自身の内面へ深く潜ることを決めた。" },
      { day: "02", date: "SEP 21", title: "静寂", mood: "Silence", color: "bg-blue-600", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop", text: "言葉が泡のように浮かんで消える。話す必要のない世界。" }
    ]
  },
  {
    id: 'issue_01',
    title: <>Raw<br />Texture</>,
    date: "AUG 01 - 07",
    tag: "ARCHIVED",
    theme: {
      bg: "bg-[#e5e5e5]",
      text: "text-gray-900",
      accent: "text-orange-600",
      cardBg: "bg-[#f5f5f5]",
      articleBg: "bg-[#f5f5f5]/95 backdrop-blur-md"
    },
    desc: <>何も持っていない、真っ白なノート。<br />初期衝動だけがそこにあった。</>,
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop",
    diaries: [
        { day: "01", date: "AUG 01", title: "初期衝動", mood: "Energy", color: "bg-red-500", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400&auto=format&fit=crop", text: "何も持っていないけれど、何も失っていない。真っ白なノートを買った日のような全能感。" }
    ]
  }
];

// --- 3. Sub Components ---

const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 z-[60] pointer-events-none opacity-[0.04]"
    style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }}
  />
);

/**
 * Component 1: BackNumberGallery
 * 上部固定のナビゲーションエリア
 */
const BackNumberGallery = ({ 
    activeId, 
    onSelect 
}: { 
    activeId: string; 
    onSelect: (id: string) => void;
}) => (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none bg-gradient-to-b from-black/60 via-black/30 to-transparent pb-8">
        {/* Nav Bar */}
        <nav className="w-full px-5 py-4 flex justify-between items-center text-white mix-blend-difference">
            <button 
                onClick={() => console.log("Back to Desk")} 
                className="pointer-events-auto flex items-center gap-2 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            >
                <ArrowLeft size={16} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Desk</span>
            </button>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Screening Room</span>
        </nav>

        {/* Filmstrip */}
        <section className="px-4 pointer-events-auto">
            <div className="flex items-start gap-4 overflow-x-auto no-scrollbar snap-x pr-4">
                {ISSUES.map((issue) => (
                    <div 
                        key={issue.id}
                        onClick={() => onSelect(issue.id)}
                        className={clsx(
                            "shrink-0 w-16 aspect-[2/3] rounded border overflow-hidden relative snap-start shadow-lg cursor-pointer transition-all duration-300",
                            activeId === issue.id 
                                ? "opacity-100 scale-100 border-white shadow-xl ring-1 ring-white/50" 
                                : "opacity-40 scale-95 border-white/30 hover:opacity-70"
                        )}
                    >
                        <img src={issue.cover} className="w-full h-full object-cover" alt="" />
                        <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="block text-[6px] text-white font-bold tracking-widest uppercase text-center">
                                {issue.date.split(' ')[0]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

/**
 * Component 2: DiarySection
 * 横スクロールする日記カード群
 */
const DiarySection = ({ 
    diaries, 
    theme 
}: { 
    diaries: DiaryEntry[]; 
    theme: ThemeConfig;
}) => {
    return (
        <div className="w-full overflow-x-auto hide-scroll pl-6 md:pl-20 pb-12">
            <motion.div 
                className="flex gap-5 w-max pr-10 items-end"
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="w-8 flex flex-col justify-end pb-4 opacity-50 shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 -rotate-90 origin-bottom-left translate-x-full">
                        <span className="w-6 h-[1px] bg-current"></span> Log
                    </span>
                </div>
                
                {diaries.map((d, i) => (
                    <div 
                        key={i}
                        className={clsx(
                            "w-64 aspect-[3/4] rounded-lg shadow-xl border border-white/10 overflow-hidden flex flex-col shrink-0 relative group cursor-pointer hover:-translate-y-2 transition-transform duration-300",
                            theme.cardBg
                        )}
                    >
                        <div className="h-[45%] relative bg-gray-500 overflow-hidden">
                            <img src={d.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110" alt="" />
                            <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded-sm">
                                <span className="text-[8px] font-bold text-white tracking-widest uppercase">{d.date}</span>
                            </div>
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                                <h3 className="font-serif text-sm font-bold mb-2">{d.title}</h3>
                                <p className="font-serif text-[10px] opacity-70 leading-relaxed text-justify line-clamp-4">"{d.text}"</p>
                            </div>
                            <div className="mt-auto pt-2 border-t border-gray-200/20 flex justify-between items-center">
                                <span className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Mood</span>
                                <div className="flex items-center gap-1.5">
                                    <div className={clsx("w-2 h-2 rounded-full", d.color)}></div>
                                    <span className="text-[8px] font-bold opacity-80">{d.mood}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="w-8 shrink-0"></div>
            </motion.div>
        </div>
    );
};

/**
 * Component 3: ArticleBody
 * 雑誌の本文エリア
 */
const ArticleBody = ({ issue }: { issue: IssueData }) => {
    return (
        <article 
            className={clsx(
                "rounded-t-[2.5rem] px-6 md:px-12 py-16 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)] min-h-screen mx-auto max-w-4xl transition-colors duration-700",
                issue.theme.articleBg // 透過背景を使用
            )}
        >
            <div className="max-w-2xl mx-auto">
                <div className="border-b border-gray-200/20 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <span className="text-[9px] bg-black text-white px-2 py-1 font-bold tracking-widest uppercase">Editorial Note</span>
                        <h2 className="font-sans text-3xl font-black mt-3 leading-none tracking-tight">THE WEEKLY<br />DIGEST.</h2>
                    </div>
                    <span className="text-[9px] font-serif opacity-50 italic flex items-center gap-1">
                        <Sparkles size={10} /> Generated by AI
                    </span>
                </div>

                <div className="space-y-10">
                    <p className="font-serif text-sm leading-[2.2] drop-cap text-justify opacity-90">
                        {issue.desc} この期間の記録には、一貫して静かなる熱量が感じられる。表面的な出来事の背後で、確実に何かが動き出している気配が漂っている。
                    </p>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={clsx("text-xs font-bold", issue.theme.accent)}>Q.</span>
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">今週のハイライト</span>
                        </div>
                        <p className="font-serif text-base font-bold mb-3 leading-relaxed">「変化は静かに訪れる」</p>
                        <p className="font-serif text-xs opacity-70 leading-loose text-justify border-l-2 border-gray-200/30 pl-3">
                            日々の記録を振り返ると、Day 01の不安が、Day 03には確信へと変わっていることがわかります。これは突発的なイベントによるものではなく、内省による緩やかなシフトでした。
                        </p>
                    </div>

                    <div className="py-8 border-y border-gray-200/20 my-6">
                        <blockquote className="font-mag text-3xl italic text-center leading-tight opacity-90">
                            “We are not moving,<br />but the world is turning.”
                        </blockquote>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-gray-200/20 text-center">
                    <button className="bg-black text-white px-12 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg hover:scale-105 transition-transform w-full md:w-auto flex items-center justify-center gap-2 mx-auto">
                        <Share2 size={14} />
                        Share Story
                    </button>
                </div>
            </div>
        </article>
    );
};

// --- 4. Main Page Component ---

export default function IssuePreviewPage() {
    const [currentIssue, setCurrentIssue] = useState<IssueData>(ISSUES[0]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });
    
    // Parallax Effects for Hero (Layer 0)
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 0.95]);
    const heroBlur = useTransform(scrollY, [0, 600], ["0px", "5px"]);

    useEffect(() => {
        // Reset scroll when issue changes
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [currentIssue]);

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans bg-slate-900 text-slate-100">
            {/* Global Styles (Fonts & Utilities) */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700&family=Inter:wght@300;400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,500&family=Manrope:wght@300;400;500&display=swap');
                .font-serif { font-family: 'Shippori Mincho', serif; }
                .font-mag { font-family: 'Cormorant Garamond', serif; }
                .drop-cap::first-letter {
                    float: left; font-size: 3.5rem; line-height: 0.8; padding-right: 0.5rem; padding-top: 0.2rem;
                    font-family: 'Cormorant Garamond', serif; font-weight: 700;
                }
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <NoiseOverlay />

            {/* Component 1: Top Navigation */}
            <BackNumberGallery 
                activeId={currentIssue.id} 
                onSelect={(id) => {
                    const next = ISSUES.find(i => i.id === id);
                    if(next) setCurrentIssue(next);
                }} 
            />

            {/* Main Scroll Container */}
            <div 
                ref={scrollRef}
                className={clsx(
                    "w-full h-full overflow-y-auto hide-scroll relative transition-colors duration-700",
                    currentIssue.theme.bg,
                    currentIssue.theme.text
                )}
            >
                {/* 
                  LAYER 0: HERO SECTION 
                  Sticky position to stay in background
                */}
                <motion.div 
                    style={{ opacity: heroOpacity, scale: heroScale, filter: `blur(${heroBlur})` }}
                    className="sticky top-0 h-screen w-full flex flex-col justify-start px-8 md:px-16 pt-48 pb-32 z-0"
                >
                    {/* Background faint cover */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <img 
                            src={currentIssue.cover} 
                            className="w-full h-full object-cover grayscale blur-sm" 
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Hero Text Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIssue.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10"
                        >
                            <div className="relative w-48 md:w-56 aspect-[3/4] shadow-2xl rotate-2 mb-8 rounded-sm overflow-hidden border border-white/20">
                                <img src={currentIssue.cover} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className={clsx("text-[9px] font-bold tracking-widest uppercase block mb-3", currentIssue.theme.accent)}>
                                {currentIssue.tag}
                            </span>
                            <h1 className="font-mag text-6xl md:text-8xl italic leading-[0.85] mb-6 drop-shadow-sm tracking-tight">
                                {currentIssue.title}
                            </h1>
                            <p className="font-serif text-xs opacity-80 leading-relaxed max-w-sm drop-shadow">
                                {currentIssue.desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* 
                  LAYER 1: SCROLLABLE CONTENT
                  Overlays the sticky hero
                */}
                <div className="relative z-10 pb-32 mt-[60vh]">
                    
                    {/* Component 2: Diaries */}
                    <DiarySection 
                        diaries={currentIssue.diaries} 
                        theme={currentIssue.theme} 
                    />

                    {/* Component 3: Article */}
                    <ArticleBody 
                        issue={currentIssue} 
                    />

                </div>
            </div>
        </div>
    );
}