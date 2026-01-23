"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Check, X, Layers, MoreHorizontal, Plus, 
  Grid, Columns, Sparkles, PenTool 
} from "lucide-react";

import clsx from "clsx";


// --- Components Import ---
// ※ 実際のファイルパスに合わせて変更してください
import { MagazinePreview, EditorPanel } from "../_components/diary_and_editor_component";

// --- Types ---
// 必要に応じて types.ts などに定義して共有することを推奨します
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


// --- Mock Data ---
// imageUrlを空にしてTldrawを表示させる
const ARCHIVE_DATA: Article[] = [
  { id: "arch-01", date: 12, rating: 85, color: "#a8a29e", imageUrl: "", title: "Morning Mist", content: "The city woke up under a blanket of white..." },
  { id: "arch-02", date: 13, rating: 60, color: "#fb923c", imageUrl: "", title: "City Noise", content: "Caught between the rhythm of traffic and my own heartbeat..." },
  { id: "arch-03", date: 14, rating: 92, color: "#34d399", imageUrl: "", title: "Quiet Corner", content: "Found a cafe that serves time instead of coffee..." },
  { id: "arch-04", date: 15, rating: 75, color: "#60a5fa", imageUrl: "", title: "Blue Hour", content: "The sky turned a deep indigo before the stars appeared..." },
  { id: "arch-05", date: 16, rating: 88, color: "#818cf8", imageUrl: "", title: "Portrait", content: "Trying to capture the expression that hides behind the smile..." },
  { id: "arch-06", date: 17, rating: 70, color: "#f472b6", imageUrl: "", title: "Neon Lights", content: "Walking home through the artificial daylight..." },
];

type ViewMode = "grid" | "carousel";

export default function ArchivePage() {
  const router = useRouter();
  
  // State
  const [articles, setArticles] = useState<Article[]>(ARCHIVE_DATA);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editMode, setEditMode] = useState<'none' | 'drawing' | 'text'>('none');

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // --- Handlers ---

  const handleUpdateArticle = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    setEditingArticle(updated);
    setEditMode('none');
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleItemClick = (article: Article) => {
    if (isSelectionMode) {
      toggleSelection(article.id);
    } else {
      setEditingArticle(article);
      setEditMode('none');
    }
  };

  const handlePointerDown = (id: string) => {
    if (isSelectionMode) return;
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setIsSelectionMode(true);
      toggleSelection(id);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handlePointerUpOrLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeEditor = () => {
    setEditingArticle(null);
    setEditMode('none');
  };

  const handleCreateMagazine = () => {
    alert(`Creating a new magazine with ${selectedIds.size} stories!`);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans selection:bg-red-100 selection:text-red-900 pb-32">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F9F8F6]/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-stone-400 hover:text-stone-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Archive</h1>
            <p className="text-[10px] text-stone-400 font-serif italic">{articles.length} Stories</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-stone-200 rounded-lg p-1 flex mr-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-1.5 rounded transition-all",
                viewMode === "grid" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("carousel")}
              className={clsx(
                "p-1.5 rounded transition-all",
                viewMode === "carousel" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Columns size={16} />
            </button>
          </div>

          {isSelectionMode ? (
            <button 
              onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
              className="text-[10px] font-bold text-red-600 uppercase tracking-widest border-b border-red-600 pb-0.5"
            >
              Cancel
            </button>
          ) : (
            <button className="p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          
          {/* --- Grid View --- */}
          {viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
              {articles.map((article) => {
                const isSelected = selectedIds.has(article.id);
                return (
                  <motion.div
                    key={article.id}
                    layoutId={`card-${article.id}`}
                    className="relative group touch-manipulation"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ 
                      scale: isSelectionMode && !isSelected ? 0.95 : 1, 
                      opacity: isSelectionMode && !isSelected ? 0.6 : 1 
                    }}
                    onPointerDown={() => handlePointerDown(article.id)}
                    onPointerUp={handlePointerUpOrLeave}
                    onPointerLeave={handlePointerUpOrLeave}
                  >
                    {/* Selection Checkmark */}
                    {isSelectionMode && (
                        <div className={clsx(
                            "absolute top-3 right-3 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors",
                            isSelected ? "bg-red-600 text-white" : "bg-white/80 border border-stone-200"
                        )}>
                            {isSelected && <Check size={14} />}
                        </div>
                    )}

                    <div onClick={() => handleItemClick(article)} className={clsx("transition-all duration-300", isSelected && "ring-2 ring-red-600 ring-offset-2 rounded-[4px]")}>
                      <MagazinePreview 
                        article={article}
                        useTldraw={true} // Tldrawを表示 (ReadOnly)
                        readOnly={true}
                        styleClass="w-full aspect-[9/16] cursor-pointer shadow-md hover:shadow-xl"
                      />
                    </div>
                  </motion.div>
                );
              })}
              <div className="aspect-[3/4] rounded border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300 gap-2">
                <Plus size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Empty</span>
              </div>
            </motion.div>
          ) : (
            
            /* --- Carousel View --- */
            <motion.div 
              key="carousel"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-6 overflow-x-auto snap-x snap-mandatory px-8 py-10 w-full h-[calc(100vh-140px)] no-scrollbar"
            >
              {articles.map((article) => {
                const isSelected = selectedIds.has(article.id);
                return (
                  <motion.div
                    key={article.id}
                    layoutId={`card-${article.id}`}
                    className="shrink-0 snap-center relative"
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onPointerDown={() => handlePointerDown(article.id)}
                    onPointerUp={handlePointerUpOrLeave}
                    onPointerLeave={handlePointerUpOrLeave}
                  >
                     {isSelectionMode && (
                        <div className={clsx(
                            "absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors",
                            isSelected ? "bg-red-600 text-white" : "bg-white border border-stone-200"
                        )}>
                            {isSelected && <Check size={16} />}
                        </div>
                    )}

                    <div onClick={() => handleItemClick(article)} className={clsx("transition-all duration-300", isSelected && "ring-4 ring-red-600 ring-offset-4 rounded-[4px]")}>
                      <MagazinePreview 
                        article={article}
                        useTldraw={true}
                        readOnly={true}
                        // Aspect ratio 3:4 Fixed, Large size for carousel
                        styleClass="w-[300px] md:w-[360px] aspect-[9/16] shadow-2xl cursor-pointer"
                      />
                    </div>
                  </motion.div>
                );
              })}
              <div className="shrink-0 w-8" /> {/* Right Padding */}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Bar (Create Magazine) */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 inset-x-0 flex justify-center z-50 px-6"
          >
            <button onClick={handleCreateMagazine} className="bg-stone-900 text-white w-full max-w-md py-4 rounded-full font-serif text-lg italic shadow-2xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
              <Layers size={18} className="text-red-500" />
              <span>Create Magazine <span className="text-xs font-sans not-italic ml-2 opacity-70 bg-white/20 px-2 py-0.5 rounded-full">{selectedIds.size}</span></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal Layer */}
      <AnimatePresence>
        {editingArticle && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 pointer-events-auto bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={closeEditor} />
            
            <motion.div 
              layoutId={`card-${editingArticle.id}`} // Hero Animation
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                y: editMode === 'text' ? -40 : 0, 
                transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)"
              }}
              // Aspect ratio fixed 3:4 for consistency
              className="relative w-full max-w-[400px] aspect-[9/16] shadow-2xl"
            >
              <button onClick={closeEditor} className="absolute -top-12 right-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50">
                <X size={20}/>
              </button>

              <MagazinePreview 
                article={editingArticle} 
                useTldraw={true} 
                readOnly={editMode !== 'drawing'} 
                styleClass="w-full h-full" 
              />
              
              {/* Edit Controls */}
              {editMode === 'none' && (
                <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setEditMode('drawing')} className="bg-white text-stone-900 w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <Sparkles size={18} />
                  </motion.button>
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setEditMode('text')} className="bg-stone-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <PenTool size={20} />
                  </motion.button>
                </div>
              )}
              {editMode === 'drawing' && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setEditMode('none')} className="absolute bottom-6 right-6 z-50 bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-colors">
                  <Check size={24} />
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Editor Panel */}
      <AnimatePresence>
        {editMode === 'text' && editingArticle && (
          <EditorPanel 
            article={editingArticle} 
            onChange={handleUpdateArticle} 
            onClose={() => setEditMode('none')} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}