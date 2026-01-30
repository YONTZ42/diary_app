"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronLeft, Calendar as CalendarIcon, PenTool, Check, Type, Palette, Star, Image as ImageIcon, Pencil } from "lucide-react";
import clsx from "clsx";


// 既存のコンポーネント（パスは適宜調整してください）
import { MagazinePreview, EditorPanel } from "../_components/diary_and_editor_component";
import { Calendar } from "../_components/calendar"; 
import { ArticleSummaryList } from "../_components/article_summary_list";
//import {MagazinePreview, EditorPanel} from './_components/diary_and_editor_conponent';
// --- Types ---
type Issue = {
  id: string;
  number: string;
  title: string;
  coverUrl: string;
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
  drawingData?: any; // Tldraw data
};

// --- Mock Data ---
// ... (データ生成ロジックは useEffect 内で保持)

// --- Sub Components ---



// --- Main Page (Desk) ---

export default function Desk() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());

  // State Logic
  const [focusedDate, setFocusedDate] = useState<number | null>(null);
  
  // モーダル表示用の状態
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  // 編集モード: 'none' | 'drawing' | 'text'
  const [editMode, setEditMode] = useState<'none' | 'drawing' | 'text'>('none');

  // Calendar Highlight Logic
  const focusedArticleIdForCalendar = useMemo(() => {
    if (!focusedDate) return null;
    const art = articles.find(a => a.date === focusedDate);
    return art ? art.id : null;
  }, [focusedDate, articles]);

  useEffect(() => {
    // Mock Data Creation
    const mockArticles: Article[] = Array.from({ length: 31 }).map((_, i) => {
        const date = i + 1;
        return {
            id: `art-${i}`,
            date: date,
            imageUrl: `https://images.unsplash.com/photo-${[
                "1501504905252-473c47e087f8", 
                "1455390582262-044cdead277a", 
                "1497633762265-9d179a990aa6", 
                "1457369300150-59302e12470c", 
                "1519791883288-dc8bd696e667", 
                "1456574808750-4139529bf648", 
            ][i % 6]}?auto=format&fit=crop&w=600&q=80`,
            issueId: date < 5 ? "issue-01" : undefined,
            title: `Journal Entry Day ${date}`,
            content: "The afternoon light filtered through the curtains, creating a soft, warm glow that seemed to suspend time itself. It was one of those rare moments where everything felt perfectly in place.",
            color: i % 3 === 0 ? "#a8a29e" : undefined,
            rating: 70 + (i % 20),
        };
    });
    setArticles(mockArticles);
    setIssues([
      { id: "issue-01", number: "01", title: "Silence", coverUrl: "https://images.unsplash.com/photo-1447752875204-b2f9f3080deb?auto=format&fit=crop&w=300&q=80" },
    ]);
  }, []);

  const handleUpdateArticle = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    // 編集中も表示中の記事を更新
    if (viewingArticle?.id === updated.id) {
        setViewingArticle(updated);
    }

  };

  const handleCalendarSelect = (articleId: string | null) => {
      if (!articleId) {
          setFocusedDate(null);
          return;
      }
      const art = articles.find(a => a.id === articleId);
      if (art) {
          setFocusedDate(prev => prev === art.date ? null : art.date);
          setActiveIssueId(null);
          setSelectedDraftIds(new Set());
      }
  };

  const handleOpenPreview = (article: Article) => {
    setViewingArticle(article);
    setEditMode('none'); 
  };

  const handleClosePreview = () => {
    setViewingArticle(null);
    setEditMode('none');
  };

  return (
    <div className="h-screen bg-stone-50 text-stone-800 font-sans flex flex-col relative overflow-hidden selection:bg-red-100 selection:text-red-900">
      
      {/* Header */}
      <header className="px-8 pt-2 pb-6 flex justify-between items-end z-20 shrink-0 sticky top-0 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50 mb-6">
        <div className="cursor-pointer group">
            <h1 className="font-serif text-3xl text-stone-900 tracking-wide font-medium group-hover:text-red-800 transition-colors">Life is Journal.</h1>
            <p className="text-[10px] text-red-700 uppercase tracking-[0.3em] font-bold mt-1">Archive of Days</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border border-white shadow-md">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover"/>
        </div>
      </header>

      {/* Main Scroll Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-stone-50 pb-40">
        
        {/* Sticky Calendar Section */}
        <div className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all pb-4 pt-2">
            <div className="px-8 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-serif text-stone-900 italic">October</span>
                    <span className="text-xs text-stone-400 font-serif mt-1">2023</span>
                </div>
                {selectedDraftIds.size > 0 && (
                    <button 
                        onClick={() => setSelectedDraftIds(new Set())}
                        className="flex items-center gap-1 text-red-700 hover:text-red-800 text-xs font-bold tracking-wider uppercase border-b border-red-700 pb-0.5"
                    >
                        <X size={10} /> Clear Selection
                    </button>
                )}
            </div>

            <div className="min-h-[300px]">
                <Calendar 
                    articles={articles} 
                    activeIssueId={activeIssueId} 
                    selectedDraftIds={selectedDraftIds}
                    focusedArticleId={focusedArticleIdForCalendar}
                    onFocusArticle={handleCalendarSelect}
                    onUpdateDraftSelection={(ids) => {
                        setSelectedDraftIds(ids);
                        if(ids.size > 0) {
                            setActiveIssueId(null);
                            setFocusedDate(null);
                        }
                    }}
                />
            </div>
        </div>

        {/* Article Summary List Area */}
        <div className="relative z-0 min-h-[100px]">
            <AnimatePresence mode="wait">
                {focusedDate ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArticleSummaryList 
                            selectedDate={focusedDate}
                            articles={articles}
                            onSelectArticle={handleOpenPreview} 
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-32 flex items-center justify-center text-stone-300 text-sm font-serif italic"
                    >
                        Select a date to view entries...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

      {/* Expanded Preview Modal */}
      {/* Expanded Preview Modal */}
      <AnimatePresence>
        {viewingArticle && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 pointer-events-auto bg-black/60 backdrop-blur-sm">
                
                <div className="absolute inset-0" onClick={handleClosePreview} />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        // テキスト編集時はキーボードに隠れないよう少し上にずらす
                        y: editMode === 'text' ? -100 : 0 
                    }} 
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-[400px] aspect-[3/5] md:aspect-[3/4] shadow-2xl z-10"
                >
                    <button onClick={handleClosePreview} className="absolute -top-12 right-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 z-50">
                        <X size={20}/>
                    </button>

                    <MagazinePreview 
                        // keyにeditModeを含めないことで、モード切替時にTldrawを再マウントさせない（これが重要）
                        key={viewingArticle.id}
                        article={viewingArticle} 
                        useTldraw={true}
                        readOnly={editMode !== 'drawing'}
                        styleClass="w-full h-full" 
                    />
                        
                    {editMode === 'none' && (
                        <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
                            <button
                                onClick={() => setEditMode('drawing')}
                                className="bg-white text-stone-900 w-12 h-12 rounded-full shadow-xl flex items-center justify-center"
                            >
                                <PenTool size={18} />
                            </button>
                            <button
                                onClick={() => setEditMode('text')}
                                className="bg-stone-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
                            >
                                <Type size={20} />
                            </button>
                        </div>
                    )}

                    {editMode === 'drawing' && (
                        <button
                            onClick={() => setEditMode('none')}
                            className="absolute bottom-6 right-6 z-50 bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
                        >
                            <Check size={24} />
                        </button>
                    )}
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Editor Panel */}
      <AnimatePresence>
        {editMode === 'text' && viewingArticle && (
            <EditorPanel 
                article={viewingArticle} 
                onChange={handleUpdateArticle} 
                // ここで閉じるときにモードを none に戻す
                onClose={() => setEditMode('none')} 
            />
        )}
      </AnimatePresence>


      {/* Floating Action Button (Batch Selection) */}
      <AnimatePresence>
        {selectedDraftIds.size > 0 && !viewingArticle && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 inset-x-0 flex justify-center z-50 pointer-events-none"
          >
             <button 
                className="pointer-events-auto bg-stone-900 text-white pl-8 pr-10 py-4 rounded-sm font-serif text-lg italic shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 hover:-translate-y-1 transition-transform border border-stone-700"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("Create Issue with IDs:", Array.from(selectedDraftIds));
                }}
             >
                 <Sparkles size={20} className="text-red-500" />
                 <span>Make Issue <span className="text-sm not-italic opacity-50 ml-1 font-sans">({selectedDraftIds.size} selected)</span></span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}