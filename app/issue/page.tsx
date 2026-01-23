"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Sparkles, PenTool, X, Check, Type, Palette, Star, Image as ImageIcon, Pencil } from "lucide-react";
import clsx from "clsx";

import "tldraw/tldraw.css";
import dynamic from 'next/dynamic';
const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
  ssr: false,
});

import { MagazinePreview, EditorPanel } from "../_components/diary_and_editor_component";

// --- 1. Type Definitions --- (変更なし)

type ThemeConfig = {
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
  articleBg: string;
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
  drawingData?: any; 
};

type IssueData = {
  id: string;
  title: string;
  verticalText: string;
  subHeading: string;
  date: string;
  theme: ThemeConfig;
  desc: React.ReactNode;
  cover: string;
  articles: Article[];
};

// --- 2. Mock Data --- (変更なし)
const ISSUES: IssueData[] = [
  {
    id: 'issue_03',
    title: "Quiet Ambition",
    verticalText: "静寂なる\n野心。",
    subHeading: "Feature Issue",
    date: "OCT 2023",
    theme: {
      bg: "bg-[#f0f0f0]",
      text: "text-gray-900",
      accent: "text-red-600",
      cardBg: "bg-white",
      articleBg: "bg-white/95 backdrop-blur-md"
    },
    desc: <>予兆の朝から始まった静かなる変化。<br />誰にも見せない葛藤の記録。</>,
    cover: "images/issues/tanabe_fashionable.png",//"https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?q=80&w=600&auto=format&fit=crop",
    articles: [
      { id: "art-01", date: 15, title: "予兆の朝", rating: 85, color: "#60a5fa", imageUrl: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=400&auto=format&fit=crop", content: "朝、カーテンの隙間から漏れる光に目が覚めたとき、世界はいつもより少しだけ静かに見えた。" },
      { id: "art-02", date: 16, title: "誰かの視線", rating: 60, color: "#fb923c", imageUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=400&auto=format&fit=crop", content: "カフェの雑踏。ノイズキャンセリングをオンにしても、背中に刺さるような焦燥感が消えない。" },
      { id: "art-03", date: 17, title: "書き留める", rating: 92, color: "#34d399", imageUrl: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?q=80&w=400&auto=format&fit=crop", content: "昨日の迷いが嘘のように、今日は言葉が溢れてくる。何も起きていない一日だったが、内面では劇的な変化が起きている。" }
    ]
  },
  {
    id: 'issue_02',
    title: "Midnight Swim",
    verticalText: "真夜中の\n遊泳。",
    subHeading: "Deep Dive",
    date: "SEP 2023",
    theme: {
      bg: "bg-[#0f172a]",
      text: "text-white",
      accent: "text-blue-400",
      cardBg: "bg-[#1e293b]",
      articleBg: "bg-[#1e293b]/95 backdrop-blur-md"
    },
    desc: <>深く息を吸い込む。言葉が泡のように消える世界で、<br />本当の自分の輪郭を確かめる旅。</>,
    cover: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?q=80&w=600&auto=format&fit=crop",
    articles: [
      { id: "art-04", date: 20, title: "潜水", rating: 80, color: "#6366f1", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop", content: "深く息を吸い込む。この号では、自分自身の内面へ深く潜ることを決めた。" },
      { id: "art-05", date: 21, title: "静寂", rating: 88, color: "#2563eb", imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop", content: "言葉が泡のように浮かんで消える。話す必要のない世界。" }
    ]
  }
];

// --- 3. Components ---



// --- Magazine Cover (変更なし) ---
const MagazineCover = ({ coverUrl, title, date, verticalText, subHeading }: { coverUrl: string; title: string; date: string; verticalText: string; subHeading: string }) => {
    return (
        <div className="relative w-full max-w-sm aspect-[3/4] shadow-2xl bg-white p-2 group transition-transform duration-700 hover:scale-[1.01] shrink-0 z-10 mx-auto">
            <div className="relative w-full h-full overflow-hidden bg-stone-100">
                <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div className="bg-red-700 text-white text-[9px] font-bold px-3 py-1 tracking-[0.2em] uppercase shadow-sm">Special Issue</div>
                        <div className="text-right mix-blend-difference text-white">
                            <span className="block text-4xl font-serif leading-none opacity-90">{date.split(' ')[0]}</span>
                            <span className="block text-[9px] tracking-[0.3em] opacity-80 mt-1">VOL.04</span>
                        </div>
                    </div>
                    <div className="absolute top-24 left-6 [writing-mode:vertical-rl] text-white drop-shadow-md space-y-6">
                        <p className="text-3xl font-serif font-bold tracking-widest text-white whitespace-pre-wrap leading-relaxed drop-shadow-lg">{verticalText}</p>
                    </div>
                    <div className="text-right space-y-2 pb-8">
                        <h2 className="text-4xl font-serif text-white font-bold italic drop-shadow-lg leading-tight">
                            <span className="text-red-500 block text-xs font-sans not-italic font-bold mb-1 tracking-[0.3em] uppercase drop-shadow-sm">{subHeading}</span>
                            {title}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. Main Page Component (Issue Preview) ---

const IssueHeroSection = ({ 
    issue, 
    onArticleClick 
}: { 
    issue: IssueData; 
    onArticleClick: (article: Article) => void;
}) => {
    return (
        <div className="w-full h-full overflow-x-auto hide-scroll flex items-center snap-x snap-mandatory pt-20 pb-20 px-4 md:px-0">
            <div className="w-full h-full shrink-0 flex items-center justify-center px-4 md:px-8 snap-center">
                <MagazineCover 
                    coverUrl={issue.cover}
                    title={issue.title}
                    date={issue.date}
                    verticalText={issue.verticalText}
                    subHeading={issue.subHeading}
                />
            </div>
            <div className="shrink-0 w-16 h-full flex flex-col justify-center items-center opacity-30 snap-align-none">
                <div className="w-[1px] h-32 bg-current mb-4"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] -rotate-90 whitespace-nowrap">Issue Contents</span>
                <div className="w-[1px] h-32 bg-current mt-4"></div>
            </div>
            {issue.articles.map((article) => (
                <div key={article.id} className="shrink-0 h-full flex items-center px-6 snap-center">
                    <MagazinePreview 
                        article={article}
                        useTldraw={true}
                        styleClass="w-80 md:w-96 aspect-[9/16] cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                        onClick={() => onArticleClick(article)}
                    />
                </div>
            ))}
            <div className="shrink-0 w-20"></div>
        </div>
    );
};

const ArticleBody = ({ issue }: { issue: IssueData }) => {
    return (
        <article className={clsx("rounded-t-[2.5rem] px-6 md:px-12 py-16 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)] min-h-screen mx-auto max-w-4xl transition-colors duration-700 relative z-20 -mt-20", issue.theme.articleBg)}>
            {/* Article Content (Same as before) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-black/10 mb-8" />
            <div className="max-w-2xl mx-auto mt-4">
                <div className="border-b border-gray-200/20 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <span className="text-[9px] bg-black text-white px-2 py-1 font-bold tracking-widest uppercase">Editorial Note</span>
                        <h2 className="font-sans text-3xl font-black mt-3 leading-none tracking-tight">THE WEEKLY<br />DIGEST.</h2>
                    </div>
                    <span className="text-[9px] font-serif opacity-50 italic flex items-center gap-1"><Sparkles size={10} /> Generated by AI</span>
                </div>
                <div className="space-y-10">
                    <p className="font-serif text-sm leading-[2.2] drop-cap text-justify opacity-90">{issue.desc}</p>
                    <div className="py-8 border-y border-gray-200/20 my-6">
                        <blockquote className="font-mag text-3xl italic text-center leading-tight opacity-90">“We are not moving,<br />but the world is turning.”</blockquote>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-gray-200/20 text-center">
                    <button className="bg-black text-white px-12 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg hover:scale-105 transition-transform w-full md:w-auto flex items-center justify-center gap-2 mx-auto">
                        <Share2 size={14} /> Share Story
                    </button>
                </div>
            </div>
        </article>
    );
};

export default function IssuePreviewPage() {
    const [currentIssue, setCurrentIssue] = useState<IssueData>(ISSUES[0]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    
    // 編集モードの状態管理: 'none' | 'drawing' | 'text'
    const [editMode, setEditMode] = useState<'none' | 'drawing' | 'text'>('none');
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });
    
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 0.95]);
    const heroBlur = useTransform(scrollY, [0, 600], ["0px", "5px"]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [currentIssue]);

    const handleArticleUpdate = (updated: Article) => {
        const newArticles = currentIssue.articles.map(a => a.id === updated.id ? updated : a);
        setCurrentIssue({ ...currentIssue, articles: newArticles });
        setSelectedArticle(updated);
        setEditMode('none');
    };

    const closeAll = () => {
        setSelectedArticle(null);
        setEditMode('none');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans bg-slate-900 text-slate-100">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700&family=Inter:wght@300;400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,500&display=swap');
                .font-serif { font-family: 'Shippori Mincho', serif; }
                .font-mag { font-family: 'Cormorant Garamond', serif; }
                .drop-cap::first-letter { float: left; font-size: 3.5rem; line-height: 0.8; padding-right: 0.5rem; padding-top: 0.2rem; font-family: 'Cormorant Garamond', serif; font-weight: 700; }
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none bg-gradient-to-b from-black/60 via-black/30 to-transparent pb-8">
                <nav className="w-full px-5 py-4 flex justify-between items-center text-white mix-blend-difference">
                    <button className="pointer-events-auto flex items-center gap-2 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                        <ArrowLeft size={16} /> <span className="text-[10px] font-bold tracking-widest uppercase">Desk</span>
                    </button>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Screening Room</span>
                </nav>
                <div className="px-4 pointer-events-auto flex items-start gap-4 overflow-x-auto no-scrollbar snap-x pr-4">
                    {ISSUES.map((issue) => (
                        <div key={issue.id} onClick={() => setCurrentIssue(issue)} className={clsx("shrink-0 w-16 aspect-[2/3] rounded border overflow-hidden relative snap-start shadow-lg cursor-pointer transition-all duration-300", currentIssue.id === issue.id ? "opacity-100 scale-100 border-white shadow-xl ring-1 ring-white/50" : "opacity-40 scale-95 border-white/30 hover:opacity-70")}>
                            <img src={issue.cover} className="w-full h-full object-cover" alt="" />
                            <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-black/90 to-transparent"><span className="block text-[6px] text-white font-bold tracking-widest uppercase text-center">{issue.date.split(' ')[0]}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Scroll Container */}
            <div ref={scrollRef} className={clsx("w-full h-full overflow-y-auto hide-scroll relative transition-colors duration-700", currentIssue.theme.bg, currentIssue.theme.text)}>
                
                {/* Hero Layer */}
                <motion.div style={{ opacity: heroOpacity, scale: heroScale, filter: `blur(${heroBlur})` }} className="sticky top-0 h-screen w-full z-0 overflow-hidden">
                    <IssueHeroSection 
                        issue={currentIssue} 
                        onArticleClick={(article) => { setSelectedArticle(article); setEditMode('none'); }} 
                    />
                </motion.div>

                {/* Article Layer */}
                <div className="relative z-10 pb-32 mt-[80vh]">
                    <ArticleBody issue={currentIssue} />
                </div>
            </div>

            {/* Expanded Preview Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 pointer-events-auto bg-black/60 backdrop-blur-sm">
                        
                        {/* 背景クリックで閉じる (描画モード中は誤操作防止のため無効にするか検討。今回は有効のまま) */}
                        <div className="absolute inset-0" onClick={closeAll} />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            // テキスト編集時はパネルにスペースを譲るため少し上に移動
                            style={{ 
                                y: editMode === 'text' ? -40 : 0, 
                                transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)"
                            }}
                            className="relative w-full max-w-[400px] aspect-[3/5] md:aspect-[3/4] shadow-2xl"
                        >
                            {/* 閉じるボタン */}
                             <button onClick={closeAll} className="absolute -top-12 right-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50">
                                <X size={20}/>
                             </button>

                             {/* プレビュー本体: 
                                拡大時は常にTldrawCanvasを表示。
                                編集モードが 'drawing' のときだけ readOnly=false にして操作可能にする。
                             */}
                             <MagazinePreview 
                                article={selectedArticle} 
                                useTldraw={true}
                                readOnly={editMode !== 'drawing'} 
                                styleClass="w-full h-full" 
                            />
                             
                             {/* 編集アクションボタン (何も編集モードに入っていないときのみ表示) */}
                             {editMode === 'none' && (
                                 <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
                                     <motion.button
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        onClick={() => setEditMode('drawing')}
                                        className="bg-white text-stone-900 w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                                        title="Draw on image"
                                     >
                                        <Pencil size={18} />
                                     </motion.button>
                                     <motion.button
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        onClick={() => setEditMode('text')}
                                        className="bg-stone-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                                        title="Edit text"
                                     >
                                        <Type size={20} />
                                     </motion.button>
                                 </div>
                             )}

                             {/* 描画モード中の完了ボタン (オーバーレイがないので直接画像の上に置く) */}
                             {editMode === 'drawing' && (
                                 <motion.button
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    onClick={() => setEditMode('none')}
                                    className="absolute bottom-6 right-6 z-50 bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-colors"
                                 >
                                     <Check size={24} />
                                 </motion.button>
                             )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Editor Panel (Text Edit Mode) */}
            <AnimatePresence>
                {editMode === 'text' && selectedArticle && (
                    <EditorPanel 
                        article={selectedArticle} 
                        onChange={handleArticleUpdate} 
                        onClose={() => setEditMode('none')} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}