"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Share2,
  Clock,
  Sparkles,
  PenTool,
  ChevronRight,
  LayoutTemplate,
  Lock
} from "lucide-react";
import Link from 'next/link'; 
import clsx from "clsx";


// --- Types ---
type IssueStatus = 'completed' | 'draft';
type IssueType = 'special' | 'weekly';

interface MagazineIssue {
    id: string;
    type: IssueType;
    status: IssueStatus;
    title: string;
    subtitle?: string;
    issueNumber: string;
    date: string; // "OCT 24" or "Last edited 2m ago"
    coverUrl: string;
}

// --- Mock Data ---
const ARCHIVE_DATA: MagazineIssue[] = [
    // Special Issues
    { 
        id: 's1', type: 'special', status: 'completed',
        title: 'The Holiday Collection', subtitle: 'Winter Memories',
        issueNumber: 'SP.01', date: 'DEC 2023',
        coverUrl:"images/issues/tanabe_fashionable.png",//'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80'
    },
    { 
        id: 's2', type: 'special', status: 'draft',
        title: 'Kyoto Travelogue', subtitle: 'Unfinished Journey',
        issueNumber: 'SP.02', date: 'Edited 2h ago',
        coverUrl: "/images/issues/image_02.png",//'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80'
    },
    // Weekly Issues
    { 
        id: 'w1', type: 'weekly', status: 'draft',
        title: 'Morning Rituals', 
        issueNumber: 'VOL.45', date: 'Edited 10m ago',
        coverUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&q=80'
    },
    { 
        id: 'w2', type: 'weekly', status: 'completed',
        title: 'Urban Rhythm', 
        issueNumber: 'VOL.44', date: 'OCT 14',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'
    },
    { 
        id: 'w3', type: 'weekly', status: 'completed',
        title: 'Coffee & Thoughts', 
        issueNumber: 'VOL.43', date: 'OCT 07',
        coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'
    },
];

// --- Components ---

/**
 * Badge Component for Status
 */
const StatusBadge = ({ status }: { status: IssueStatus }) => {
    if (status === 'completed') {
        return (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-stone-200 bg-white text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                <span>Published</span>
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-red-200 bg-red-50 text-[9px] font-bold text-red-700 uppercase tracking-widest animate-pulse">
            <PenTool size={10} />
            <span>Drafting...</span>
        </div>
    );
};

/**
 * Magazine Cover Thumbnail (For Completed Issues)
 */
const MagazineCoverThumbnail = ({ issue }: { issue: MagazineIssue }) => {
    // 既存データから雑誌風のメタデータを生成
    const config = {
        title: "VOGUE",
        verticalText: "私という\n現象。",
        mainHeading: issue.title,
        subHeading: issue.subtitle || "Feature Model",
        issueDate: issue.issueNumber,
        displayDate: issue.date.split(' ')[0] // "DEC" etc.
    };

    return (
        <div className="relative w-full h-full bg-stone-100 overflow-hidden">
             {/* Background Title Watermark */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[80px] font-serif font-black text-stone-200/50 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none opacity-40 scale-150 origin-top">
                {config.title}
            </div>

            <img 
                src={issue.coverUrl} 
                alt={issue.title} 
                className="w-full h-full object-cover filter contrast-[1.05]" 
            />

            {/* Magazine Overlays */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="bg-red-700 text-white text-[7px] font-bold px-2 py-0.5 tracking-[0.2em] uppercase shadow-sm">
                        Special Issue
                    </div>
                    <div className="text-right mix-blend-difference text-white">
                        <span className="block text-3xl font-serif leading-none opacity-90">{config.displayDate}</span>
                        <span className="block text-[7px] tracking-[0.3em] opacity-80 mt-0.5">{config.issueDate}</span>
                    </div>
                </div>

                {/* Vertical Text */}
                <div className="absolute top-16 left-4 [writing-mode:vertical-rl] text-white drop-shadow-md space-y-4">
                    <p className="text-xl font-serif font-bold tracking-widest text-white whitespace-pre-wrap leading-relaxed drop-shadow-lg">
                        {config.verticalText}
                    </p>
                </div>

                {/* Footer Texts */}
                <div className="text-right space-y-1 pb-4">
                    <h2 className="text-2xl font-serif text-white font-bold italic drop-shadow-lg leading-tight">
                        <span className="text-red-500 block text-[8px] font-sans not-italic font-bold mb-0.5 tracking-[0.3em] uppercase drop-shadow-sm">
                            {config.subHeading}
                        </span>
                        {config.mainHeading}
                    </h2>
                    <div className="w-8 h-0.5 bg-white/80 ml-auto mb-1" />
                    <p className="text-[7px] text-white/90 tracking-wider font-serif leading-relaxed drop-shadow-md">
                        あなただけのスタイル、<br/>AIが引き出す新しい表情。
                    </p>
                </div>
            </div>
        </div>
    );
};



/**
 * 1. Special Issue Card (Large, Horizontal Scroll)
 */
const SpecialIssueCard = ({ issue }: { issue: MagazineIssue }) => {
    return (
        <div className="relative shrink-0 w-[280px] mr-6 group cursor-pointer">
            {/* 3:4 Main Cover Area */}
            <div className="relative w-full aspect-[3/4] bg-stone-200 shadow-xl overflow-hidden mb-4 border border-stone-100">
                
                {/* --- 変更点: ステータスに応じて表示を切り替え --- */}
                {issue.status === 'completed' ? (
                    <MagazineCoverThumbnail issue={issue} />
                ) : (
                    // ドラフト（制作中）の場合の表示
                    <>
                        <img 
                            src={issue.coverUrl} 
                            alt={issue.title} 
                            className="w-full h-full object-cover opacity-80 grayscale-[0.3] blur-[1px]"
                        />
                        
                        {/* Draft Overlay */}
                        <div className="absolute inset-0 bg-stone-900/10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white/90 px-4 py-2 shadow-sm border border-stone-200">
                                <span className="text-xs font-serif font-bold text-stone-800 tracking-widest flex items-center gap-2">
                                    <PenTool size={12} className="text-red-700" /> RESUME
                                </span>
                            </div>
                        </div>
                    </>
                )}


                {/* Decorative Frame */}
                <div className="absolute inset-0 border-[0.5px] border-white/20 pointer-events-none" />
                <div className="absolute top-3 right-3 text-white drop-shadow-md">
                    <Sparkles size={16} className={clsx(issue.status === 'completed' ? "opacity-100" : "opacity-50")} />
                </div>
            </div>

            {/* Info Area */}
            <div className="px-1">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-red-700 tracking-[0.2em]">{issue.issueNumber}</span>
                    <StatusBadge status={issue.status} />
                </div>
                <h3 className="text-xl font-serif text-stone-900 leading-tight mb-1 group-hover:text-red-800 transition-colors">
                    {issue.title}
                </h3>
                <p className="text-xs text-stone-400 font-serif italic">{issue.subtitle}</p>
            </div>
        </div>
    );
};

/**
 * 2. Weekly Issue Card (List Item)
 */
const WeeklyIssueCard = ({ issue }: { issue: MagazineIssue }) => {
    return (
        <div className="flex gap-5 mb-8 group cursor-pointer border-b border-stone-100 pb-8 last:border-0">
            {/* 3:4 Cover Thumbnail */}
            <div className="relative w-24 aspect-[3/4] bg-stone-200 shadow-md shrink-0 overflow-hidden border border-stone-100">
                
                {/* --- 変更点: ステータスに応じて MagazineCoverThumbnail を表示 --- */}
                {issue.status === 'completed' ? (
                    // 小さいサイズでもレイアウトが崩れないよう、必要に応じてフォントサイズ調整版を作るか
                    // ここではコンテナに合わせて縮小表示されることを想定して配置します
                    <div className="w-full h-full text-[0.5em]"> {/* 文字サイズを親から相対的に少し小さくする調整 */}
                        <MagazineCoverThumbnail issue={issue} />
                    </div>
                ) : (
                    <>
                        <img 
                            src={issue.coverUrl} 
                            className="w-full h-full object-cover opacity-60 transition-all" 
                        />
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-50/30">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-red-700">
                                <PenTool size={14} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Side Info */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                                {issue.issueNumber}
                            </span>
                            <h3 className="text-lg font-serif text-stone-800 leading-tight group-hover:text-red-800 transition-colors">
                                {issue.title}
                            </h3>
                        </div>
                        <button className="text-stone-300 hover:text-stone-600 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    
                    <div className="mt-2">
                       <StatusBadge status={issue.status} />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                        {issue.status === 'draft' ? <Clock size={12} /> : <Share2 size={12} />}
                        <span>{issue.date}</span>
                    </div>
                    
                    {issue.status === 'draft' ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-stone-800 hover:underline decoration-red-700 underline-offset-4">
                            Resume Editing <ChevronRight size={12} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 group-hover:text-stone-800 transition-colors">
                            View Issue <ChevronRight size={12} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

export default function MagazineArchivePage() {
    const specialIssues = ARCHIVE_DATA.filter(i => i.type === 'special');
    const weeklyIssues = ARCHIVE_DATA.filter(i => i.type === 'weekly');

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-red-100 selection:text-red-900 pb-20">
            
            {/* Header */}
            <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md px-6 pt-12 pb-4 border-b border-stone-200/50 flex justify-between items-end">
                <div>
                    <h1 className="font-serif text-2xl text-stone-900 tracking-wide">My Journal</h1>
                    <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold mt-1">
                        Library & Drafts
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-stone-400 hover:text-stone-800 transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="p-2 bg-stone-900 text-white shadow-lg hover:bg-red-800 transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            <main className="pt-8">
                
                {/* 1. Special Issues Section (Horizontal Scroll) */}
                <section className="mb-12">
                    <div className="px-6 mb-5 flex items-end justify-between">
                        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-red-700" /> Special Issues
                        </h2>
                        <span className="text-[10px] text-stone-400 font-serif italic">Curated Collection</span>
                    </div>
                    
                    <div className="overflow-x-auto px-6 pb-6 scrollbar-hide -mr-6">
                        <div className="flex w-max">
                            {/* Create New Special Placeholder */}
                            <button className="shrink-0 w-[60px] aspect-[3/4] mr-6 border border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-stone-300 hover:text-red-700 hover:border-red-700 hover:bg-red-50 transition-all group">
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] [writing-mode:vertical-rl] font-bold tracking-widest uppercase">Create New</span>
                            </button>

                            {specialIssues.map(issue => (
                                <Link href="/issue">
                                <SpecialIssueCard key={issue.id} issue={issue} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. Weekly Archive Section (Vertical List) */}
                <section className="px-6">
                    <div className="mb-6 flex items-end justify-between border-b border-stone-200 pb-2">
                        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                            <LayoutTemplate size={14} className="text-stone-400" /> Weekly Archive
                        </h2>
                        <span className="text-[10px] text-stone-400">{weeklyIssues.length} ISSUES</span>
                    </div>

                    <div className="flex flex-col">
                        {weeklyIssues.map(issue => (
                            <WeeklyIssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                </section>

            </main>
            
            {/* Footer / Hint */}
            <div className="text-center py-8 opacity-40">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500 font-serif">
                    End of Archive
                </p>
            </div>
        </div>
    );
}