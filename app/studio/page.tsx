"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Save, 
  Calendar as CalendarIcon, 
  Settings2, 
  AlignLeft,
  Image as ImageIcon,
  PenTool,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X
} from "lucide-react";
import clsx from "clsx";
import { Calendar } from "../_components/calendar";

// --- Assets & Utilities (From page_old.tsx) ---
const PaperTexture = () => (
  <div 
    className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] mix-blend-multiply"
    style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
    }}
  />
);

// --- Types ---
type TabType = 'calendar' | 'magazine' | 'content';

type LogData = {
    id: string;
    date: number; // 1-30
    imageUrl?: string | null; // null許容に変更
    title?: string;
    content?: string;
};

// --- Mock Data ---
const MOCK_LOGS: LogData[] = [
    { id: "log-1", date: 2, imageUrl: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&q=80", title: "Morning Mist" },
    { id: "log-2", date: 5, imageUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&q=80", title: "City Lights" },
    { id: "log-3", date: 8, imageUrl: null, title: "No Photo Day" },
    { id: "log-4", date: 12, imageUrl: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?w=400&q=80", title: "Afternoon Coffee" },
    { id: "log-5", date: 15, imageUrl: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&q=80", title: "Holiday Decor" },
    { id: "log-6", date: 22, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", title: "Portrait Study" },
];

// --- Components ---

/**
 * 1. Magazine Cover Preview (Light Theme)
 */
const MagazineCoverPreview = ({ 
    title, 
    subTitle, 
    coverImage, 
    theme,
    selectedCount 
}: { 
    title: string; 
    subTitle: string; 
    coverImage: string | null;
    theme: string;
    selectedCount: number;
}) => {
    return (
        <div className="w-full pt-6 pb-2 px-6 flex flex-col items-center z-10 relative">
            {/* Shadow & Container */}
            <div className="relative w-48 aspect-[3/4] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] p-1.5 transition-transform duration-700 hover:scale-[1.01] group">
                <div className="relative w-full h-full overflow-hidden bg-stone-100 border border-stone-100">
                    {/* Image Layer: Check for null/empty string */}
                    {coverImage ? (
                        <img 
                            src={coverImage} 
                            className={clsx(
                                "w-full h-full object-cover transition-all duration-500 filter contrast-[1.1]", 
                                theme === 'monotone' && "grayscale contrast-125"
                            )} 
                            alt="Cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-300 gap-2">
                            <ImageIcon size={24} />
                            <span className="text-[10px] font-mono tracking-widest">NO IMAGE</span>
                        </div>
                    )}

                    {/* Text Layer */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="bg-red-700 text-white text-[6px] font-bold px-2 py-0.5 tracking-[0.2em] uppercase shadow-sm">
                                Issue.01
                            </div>
                            <div className="text-right">
                                <span className="block text-[8px] tracking-[0.2em] text-white/90 drop-shadow-md font-bold">VOL.8</span>
                            </div>
                        </div>

                        <div className="text-center space-y-1 pb-4">
                            <h2 className="text-3xl font-serif text-white font-bold italic drop-shadow-lg leading-none tracking-tight">
                                {title || "UNTITLED"}
                            </h2>
                            <div className="w-6 h-0.5 bg-white/80 mx-auto mb-1 shadow-sm" />
                            <p className="text-[7px] text-white/90 tracking-widest font-sans uppercase drop-shadow-md font-bold">
                                {subTitle || "Diary Collection"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Overlay (Tag style) */}
                <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-stone-900 shadow-md text-[8px] font-bold tracking-widest text-white uppercase transform rotate-[-2deg]">
                    {selectedCount} Scenes
                </div>
            </div>
        </div>
    );
};

/**
 * 2. Tab Navigation (Light Theme)
 */
const TabButton = ({ 
    active, 
    onClick, 
    icon: Icon, 
    label 
}: { 
    active: boolean; 
    onClick: () => void; 
    icon: any; 
    label: string; 
}) => (
    <button 
        onClick={onClick}
        className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-1.5 py-4 transition-all relative group",
            active ? "text-red-700" : "text-stone-400 hover:text-stone-600"
        )}
    >
        <Icon size={16} className={clsx("transition-transform", active && "scale-110")} />
        <span className={clsx(
            "text-[9px] font-bold tracking-[0.2em] uppercase font-serif",
            active ? "opacity-100" : "opacity-70"
        )}>
            {label}
        </span>
        {active && (
            <motion.div 
                layoutId="activeTab"
                className="absolute bottom-2 w-1 h-1 bg-red-700 rounded-full"
            />
        )}
    </button>
);

/**
 * 3. Encouragement Card (Light Theme)
 */
const CtaCard = ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onClick 
}: { 
    icon: any; 
    title: string; 
    description: string; 
    actionLabel: string; 
    onClick?: () => void 
}) => (
    <div className="bg-white border border-stone-200 p-4 flex items-start gap-4 mb-3 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md">
        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 mt-0.5">
            <Icon size={16} />
        </div>
        <div className="flex-1">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">{title}</h4>
            <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-serif">{description}</p>
        </div>
        <button 
            onClick={onClick}
            className="px-3 py-1.5 bg-stone-900 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-800 transition-colors shrink-0"
        >
            {actionLabel}
        </button>
    </div>
);

// --- Main Page ---

export default function MagazineEditPage() {
    // State
    const [activeTab, setActiveTab] = useState<TabType>('calendar');
    const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());
    
    // Magazine Config
    const [title, setTitle] = useState("OCTOBER");
    const [subTitle, setSubTitle] = useState("Memories of Autumn");
    const [theme, setTheme] = useState("standard");
    const [notes, setNotes] = useState("");
    const [coverImageId, setCoverImageId] = useState<string | null>(null);

    // Focused Article in Calendar (Single tap)
    const [focusedArticleId, setFocusedArticleId] = useState<string | null>(null);

    // Derived Data: Generate 30 Days of Articles
    const calendarArticles = useMemo(() => {
        // 1日から30日までの配列を生成し、ログがある場合はマージする
        return Array.from({ length: 30 }, (_, i) => {
            const date = i + 1;
            const log = MOCK_LOGS.find(l => l.date === date);
            
            return {
                id: log?.id || `empty-${date}`, // ログがない日もIDを持たせる
                date: date,
                // src=""エラー回避のため、画像がない場合は null を渡す
                imageUrl: (log?.imageUrl && log.imageUrl !== "") ? log.imageUrl : "", 
                issueId: undefined // 今回は未使用
            };
        });
    }, []);

    const selectedCount = selectedDraftIds.size;

    // Cover Image Logic
    const activeCoverUrl = useMemo(() => {
        if (coverImageId) {
            const log = MOCK_LOGS.find(l => l.id === coverImageId);
            return (log?.imageUrl && log.imageUrl !== "") ? log.imageUrl : null;
        }
        // Auto-select first selected item with an image
        const firstSelectedId = Array.from(selectedDraftIds).find(id => {
            const log = MOCK_LOGS.find(l => l.id === id);
            return log?.imageUrl && log.imageUrl !== "";
        });
        if (firstSelectedId) {
            const log = MOCK_LOGS.find(l => l.id === firstSelectedId);
            return log?.imageUrl || null;
        }
        return null;
    }, [coverImageId, selectedDraftIds]);

    // Handlers
    const handleUpdateDraftSelection = (newSet: Set<string>) => {
        setSelectedDraftIds(newSet);
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans pb-20 relative selection:bg-red-100 selection:text-red-900">
            <PaperTexture />
            
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-stone-200/50">
                <button className="p-2 -ml-2 text-stone-400 hover:text-stone-800 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="font-serif text-lg text-stone-900 tracking-wide font-medium">Life is Journal.</h1>
                    <p className="text-[9px] text-red-700 uppercase tracking-[0.2em] font-bold">Issue Editor</p>
                </div>
                <button className="p-2 -mr-2 text-stone-800 hover:text-red-700 transition-colors flex items-center gap-1 group">
                    <span className="text-[10px] font-bold uppercase hidden sm:inline tracking-widest group-hover:underline">Save</span>
                    <Save size={18} />
                </button>
            </header>

            {/* Top: Cover Preview */}
            <MagazineCoverPreview 
                title={title}
                subTitle={subTitle}
                coverImage={activeCoverUrl}
                theme={theme}
                selectedCount={selectedCount}
            />

            {/* Middle: Tabs */}
            <div className="sticky top-[68px] z-40 bg-[#fafaf9]/95 backdrop-blur-md border-b border-stone-200/50 px-4 shadow-sm">
                <div className="flex items-center max-w-md mx-auto">
                    <TabButton 
                        active={activeTab === 'calendar'} 
                        onClick={() => setActiveTab('calendar')} 
                        icon={CalendarIcon} 
                        label="Calendar" 
                    />
                    <TabButton 
                        active={activeTab === 'magazine'} 
                        onClick={() => setActiveTab('magazine')} 
                        icon={Settings2} 
                        label="Design" 
                    />
                    <TabButton 
                        active={activeTab === 'content'} 
                        onClick={() => setActiveTab('content')} 
                        icon={AlignLeft} 
                        label="Stories" 
                    />
                </div>
            </div>

            {/* Bottom: Tab Content Area */}
            <main className="min-h-[400px] relative z-10 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    
                    {/* TAB 1: CALENDAR */}
                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="py-6">
                                <div className="px-6 mb-4 flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-red-700" />
                                        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                                            Select Days
                                        </h3>
                                    </div>
                                    <span className="text-[9px] text-stone-400 font-serif italic">
                                        Long press to select
                                    </span>
                                </div>

                                {/* Calendar Component */}
                                <Calendar 
                                    articles={calendarArticles}
                                    activeIssueId={null}
                                    selectedDraftIds={selectedDraftIds}
                                    focusedArticleId={focusedArticleId}
                                    onFocusArticle={setFocusedArticleId}
                                    onUpdateDraftSelection={handleUpdateDraftSelection}
                                />

                                {/* User Encouragement / Action Area */}
                                <div className="px-6 mt-2">
                                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-200 pb-1">
                                        Suggestions
                                    </h3>
                                    
                                    {selectedCount === 0 ? (
                                        <CtaCard 
                                            icon={Sparkles}
                                            title="Start Your Issue"
                                            description="Tap and hold dates on the calendar to add them to this magazine."
                                            actionLabel="Select All"
                                            onClick={() => {
                                                const allIds = MOCK_LOGS.filter(l => l.imageUrl).map(l => l.id);
                                                setSelectedDraftIds(new Set(allIds));
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 mb-4">
                                            <div>
                                                <span className="text-xl font-bold text-stone-800 font-serif block">{selectedCount}</span>
                                                <span className="text-[9px] text-stone-400 uppercase tracking-widest">Days Selected</span>
                                            </div>
                                            <div className="w-10 h-10 border-2 border-stone-200 border-t-red-700 rounded-full flex items-center justify-center">
                                                <CheckCircle2 size={16} className="text-red-700" />
                                            </div>
                                        </div>
                                    )}

                                    {MOCK_LOGS.some(l => !l.imageUrl) && (
                                        <CtaCard 
                                            icon={UploadCloud}
                                            title="Missing Photos"
                                            description="Some diary entries have text but no photos. Add photos to include them."
                                            actionLabel="Upload"
                                            onClick={() => alert("Open Photo Picker")}
                                        />
                                    )}

                                    <CtaCard 
                                        icon={PenTool}
                                        title="Write Today"
                                        description="You haven't logged today's memory yet. Keep the streak alive."
                                        actionLabel="Write"
                                        onClick={() => alert("Open Editor")}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: MAGAZINE SETTINGS */}
                    {activeTab === 'magazine' && (
                        <motion.div
                            key="magazine"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6 space-y-8"
                        >
                            {/* Title Settings */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    <PenTool size={12} /> Magazine Info
                                </label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Magazine Title"
                                    className="w-full bg-white border border-stone-200 p-4 text-stone-800 placeholder:text-stone-300 focus:border-red-700 focus:outline-none transition-colors font-serif text-xl shadow-sm"
                                />
                                <input 
                                    type="text" 
                                    value={subTitle}
                                    onChange={(e) => setSubTitle(e.target.value)}
                                    placeholder="Subtitle / Catchphrase"
                                    className="w-full bg-white border border-stone-200 p-3 text-sm text-stone-600 placeholder:text-stone-300 focus:border-red-700 focus:outline-none transition-colors shadow-sm"
                                />
                            </div>

                            {/* Theme Selection */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    Atmosphere
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['standard', 'monotone', 'vivid'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={clsx(
                                                "py-3 border text-[9px] font-bold uppercase tracking-widest transition-all",
                                                theme === t 
                                                    ? "bg-stone-900 border-stone-900 text-white shadow-lg" 
                                                    : "bg-white border-stone-200 text-stone-400 hover:border-stone-400"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cover Selection */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    Cover Photo
                                </label>
                                <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                                    <button 
                                        onClick={() => setCoverImageId(null)}
                                        className={clsx(
                                            "w-20 aspect-[3/4] shrink-0 border flex items-center justify-center bg-white transition-all",
                                            !coverImageId ? "border-red-700 ring-1 ring-red-700" : "border-stone-200"
                                        )}
                                    >
                                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">AUTO</span>
                                    </button>
                                    
                                    {Array.from(selectedDraftIds).map(id => {
                                        // MOCK_LOGSから探す
                                        const log = MOCK_LOGS.find(l => l.id === id);
                                        // 画像がない、または空文字の場合は表示しない
                                        if (!log?.imageUrl || log.imageUrl === "") return null;

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setCoverImageId(id)}
                                                className={clsx(
                                                    "w-20 aspect-[3/4] shrink-0 border overflow-hidden relative transition-all",
                                                    coverImageId === id ? "border-red-700 ring-1 ring-red-700 shadow-md" : "border-stone-200 opacity-70 hover:opacity-100"
                                                )}
                                            >
                                                <img src={log.imageUrl} className="w-full h-full object-cover" alt="" />
                                                {coverImageId === id && (
                                                    <div className="absolute inset-0 bg-red-700/10 flex items-center justify-center">
                                                        <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    Editor's Note
                                </label>
                                <textarea 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Write something about this issue..."
                                    className="w-full h-32 bg-white border border-stone-200 p-4 text-sm text-stone-700 placeholder:text-stone-300 focus:border-red-700 focus:outline-none transition-colors resize-none shadow-sm font-serif"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: CONTENT LIST */}
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6"
                        >
                             <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    <AlignLeft size={12} /> Selected Stories
                                </label>
                                <span className="text-[10px] text-stone-500 font-mono">{selectedCount} ITEMS</span>
                            </div>

                            <div className="space-y-3">
                                {Array.from(selectedDraftIds).map((id, index) => {
                                    const log = MOCK_LOGS.find(l => l.id === id);
                                    if(!log) return null;
                                    return (
                                        <div key={id} className="flex items-center gap-4 bg-white p-3 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="w-6 text-center">
                                                <span className="text-[10px] text-stone-300 font-mono block">0{index + 1}</span>
                                            </div>
                                            <div className="w-12 h-12 bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                                                {(log.imageUrl && log.imageUrl !== "") ? (
                                                    <img src={log.imageUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                        <ImageIcon size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-bold text-red-700 uppercase tracking-widest block mb-0.5">
                                                    Oct {log.date}
                                                </span>
                                                <h4 className="text-sm text-stone-800 truncate font-serif">
                                                    {log.title || "Untitled Entry"}
                                                </h4>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newSet = new Set(selectedDraftIds);
                                                    newSet.delete(id);
                                                    setSelectedDraftIds(newSet);
                                                }}
                                                className="text-stone-300 hover:text-stone-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {selectedCount === 0 && (
                                    <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200 bg-stone-50/50">
                                        <p className="text-sm font-serif italic">No stories selected yet.</p>
                                        <button 
                                            onClick={() => setActiveTab('calendar')}
                                            className="mt-3 text-[10px] text-stone-800 font-bold uppercase tracking-widest border-b border-stone-800 pb-0.5 hover:text-red-700 hover:border-red-700 transition-colors"
                                        >
                                            Go to Calendar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

        </div>
    );
}