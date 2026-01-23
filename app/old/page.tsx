"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Send, Sparkles, BookOpen, Mic, ChevronRight } from "lucide-react";
import clsx from "clsx";

// --- Types ---
type Article = {
  id: string;
  date: number;
  imageUrl: string;
  richness: number;
  issueId?: string;
};

type Issue = {
  id: string;
  number: string;
  title: string;
  theme: string;
  coverGradient: string;
};

// --- Helper: Typing Animation ---
const TypingText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40); // speed
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}</span>;
};

// --- Component: AI Board ---
const AIBoard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 mx-6 mb-24 p-5 rounded-xl bg-surface/50 border border-white/5 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
      <div className="flex items-start gap-4">
        {/* Waveform Indicator */}
        <div className="flex gap-1 items-end h-4 mt-1 shrink-0">
           {[1,2,3].map(i => (
             <motion.div 
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                className="w-1 bg-gold rounded-full"
             />
           ))}
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] text-gold uppercase tracking-widest mb-1 font-serif">Editor-in-Chief's Proposal</p>
          <div className="text-sm text-white/90 font-light leading-relaxed font-sans">
             <TypingText text="最近の週末、素敵なカフェ巡りになっていませんか？『東京カフェ紀行』として編み直しましょう。" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Component: Gallery ---
const Gallery = ({ issues, activeIssueId, onSelectIssue, highlightIssueId }: any) => {
  return (
    <div className="w-full pt-14 pb-4 pl-6 overflow-x-auto no-scrollbar z-30 relative shrink-0">
      <div className="flex gap-5 pr-6 items-end h-[240px]">
        {/* Next Issue Placeholder */}
        <div className={clsx("min-w-[130px] h-[190px] border border-white/5 rounded-sm flex flex-col items-center justify-center text-white/20 italic bg-white/5 transition-opacity duration-300", highlightIssueId ? "opacity-20" : "opacity-100")}>
            <span className="text-xs tracking-widest">Next Issue...</span>
        </div>

        {issues.map((issue: Issue) => {
          const isActive = activeIssueId === issue.id;
          const isHighlighted = highlightIssueId === issue.id;
          // ハーフシート表示中は、ハイライト以外を暗くする
          const shouldDim = highlightIssueId && !isHighlighted;

          return (
            <motion.div
              key={issue.id}
              layoutId={`card-${issue.id}`}
              onClick={() => onSelectIssue(isActive ? null : issue.id)}
              className={clsx(
                "relative rounded-sm shadow-2xl cursor-pointer transition-all duration-500 ease-out origin-bottom overflow-hidden bg-cover bg-center",
                issue.coverGradient,
                isActive ? "min-w-[170px] h-[250px] ring-1 ring-gold shadow-gold-glow z-50 translate-y-[-5px]" : "min-w-[130px] h-[190px] grayscale hover:grayscale-0",
                shouldDim ? "opacity-20 blur-[2px]" : "opacity-100",
                isHighlighted ? "z-50 ring-2 ring-gold scale-105" : ""
              )}
            >
               <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
               <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <span className="text-[8px] tracking-[0.3em] font-bold uppercase text-white border-b border-white/30 pb-2">The Life Log</span>
                  <div>
                    <h3 className="font-serif text-lg text-white leading-tight mb-1">{issue.title}</h3>
                    <p className="text-[8px] text-white/80 tracking-widest uppercase">ISSUE {issue.number}</p>
                  </div>
               </div>
               
               {isActive && (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute -top-10 w-full flex justify-center">
                    <div className="bg-midnight/80 border border-gold text-gold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase flex gap-2">
                      <BookOpen size={10} /> View
                    </div>
                 </motion.div>
               )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// --- Component: Calendar with Gooey Selection ---
const Calendar = ({ articles, activeIssueId, selectedIds, onSelectionChange, onOpenEditor, emptyDays }: any) => {
  const isDraggingSelection = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG Filter for Gooey Effect (Defined in layout or here)
  const renderGooeyFilter = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="goo-calendar">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );

  // Background Gooey Layer
  const GooeyLayer = () => (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ filter: 'url(#goo-calendar)' }}>
      <div className="grid grid-cols-7 gap-1.5 p-0">
        {Array.from({ length: emptyDays }).map((_, i) => <div key={`g-off-${i}`} className="aspect-square" />)}
        {articles.map((art: Article) => (
           <div key={`goo-${art.id}`} className="aspect-square flex items-center justify-center">
             {selectedIds.includes(art.id) && (
               <motion.div 
                 layoutId={`goo-circle-${art.id}`}
                 initial={{ scale: 0 }} animate={{ scale: 1.2 }}
                 className="w-full h-full bg-gold/50 rounded-full"
               />
             )}
           </div>
        ))}
      </div>
    </div>
  );

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
     if (activeIssueId) return;
     // Long press detection
     const timer = setTimeout(() => {
         isDraggingSelection.current = true;
         if (!selectedIds.includes(id)) {
            onSelectionChange([...selectedIds, id]);
         }
         if (navigator.vibrate) navigator.vibrate(20);
     }, 400);

     const cancel = () => clearTimeout(timer);
     e.target.addEventListener('pointerup', cancel, { once: true });
     e.target.addEventListener('pointerleave', cancel, { once: true });
  };

  const handlePointerEnter = (id: string) => {
      if (isDraggingSelection.current) {
          if (!selectedIds.includes(id)) {
              onSelectionChange([...selectedIds, id]);
              if (navigator.vibrate) navigator.vibrate(5);
          }
      }
  };

  const handleClick = (art: Article) => {
      if (activeIssueId) return;
      if (selectedIds.length > 0) {
          // In selection mode: toggle
          if (selectedIds.includes(art.id)) {
             onSelectionChange(selectedIds.filter((sid: string) => sid !== art.id));
          } else {
             onSelectionChange([...selectedIds, art.id]);
          }
      } else {
          onOpenEditor(art);
      }
  };

  // Stop dragging on global up
  useEffect(() => {
      const stopDrag = () => { isDraggingSelection.current = false; };
      window.addEventListener('pointerup', stopDrag);
      return () => window.removeEventListener('pointerup', stopDrag);
  }, []);

  return (
    <div className="relative w-full px-4 z-10" ref={containerRef}>
      {renderGooeyFilter()}
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-2 text-center text-[10px] text-white/30 font-serif tracking-widest">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`h-${i}`}>{d}</span>)}
      </div>

      <div className="relative">
        <GooeyLayer />
        
        <div className="grid grid-cols-7 gap-1.5 auto-rows-fr relative z-10">
           {Array.from({ length: emptyDays }).map((_, i) => <div key={`offset-${i}`} />)}

           {articles.map((art: Article) => {
               const isSelected = selectedIds.includes(art.id);
               const isDimmed = activeIssueId && art.issueId !== activeIssueId;
               const isToday = art.date === new Date().getDate();

               return (
                 <motion.div
                   key={art.id}
                   layout
                   onPointerDown={(e) => handlePointerDown(art.id, e)}
                   onPointerEnter={() => handlePointerEnter(art.id)}
                   onClick={() => handleClick(art)}
                   className={clsx(
                     "relative aspect-square rounded overflow-hidden cursor-pointer transition-all duration-300",
                     isDimmed ? "opacity-20 grayscale" : "opacity-100",
                     isSelected ? "scale-90 z-20" : "scale-100"
                   )}
                   // Prevent touch scroll while dragging selection (CSS touch-action needed in global)
                   style={{ touchAction: selectedIds.length > 0 ? 'none' : 'auto' }} 
                 >
                   {/* Photo */}
                   <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${art.imageUrl})` }} />
                   <div className="absolute inset-0 bg-black/20" /> {/* brightness adjustment */}

                   {/* Today Indicator */}
                   {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full z-30" />}

                   {/* Date Number */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                       <span className={clsx(
                           "font-serif text-lg tracking-tight transition-colors drop-shadow-md",
                           isSelected || isToday ? "text-gold font-bold scale-110" : "text-white"
                       )}>
                           {art.date}
                       </span>
                   </div>
                   
                   {/* Selected Overlay (Metaball is handled by GooeyLayer in background) */}
                   {isSelected && <div className="absolute inset-0 bg-gold/20 mix-blend-overlay" />}

                 </motion.div>
               );
           })}
        </div>
      </div>
    </div>
  );
};

// --- Component: Horizontal Swipeable Sheet ---
const SwipeableSheet = ({ isOpen, onClose, article, onNavigate, onUpdateRichness }: any) => {
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
      { role: 'ai', text: '今日の一枚ですね。この写真を撮った瞬間、何を感じていましたか？' }
  ]);
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState(0);

  // Reset chat when article changes
  useEffect(() => {
      setMessages([{ role: 'ai', text: '今日の一枚ですね。この写真を撮った瞬間、何を感じていましたか？' }]);
      setInput("");
  }, [article?.id]);

  const handleSend = () => {
      if(!input) return;
      setMessages([...messages, { role: 'user', text: input }]);
      setInput("");
      onUpdateRichness(article.id, 1.0); // Demo: Max richness
      setTimeout(() => setMessages(prev => [...prev, { role: 'ai', text: '素敵な視点です。' }]), 800);
  };

  // Drag End for Horizontal Swipe (Change Day)
  const onDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = offset.x;

    if (swipe < -50) {
       setDirection(1);
       onNavigate(1); // Next day
    } else if (swipe > 50) {
       setDirection(-1);
       onNavigate(-1); // Prev day
    } else if (offset.y > 100) {
       onClose(); // Close on drag down
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <AnimatePresence>
      {isOpen && article && (
        <>
          {/* Backdrop (Allows seeing Back Number Gallery) */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 pointer-events-auto"
            style={{ backdropFilter: 'blur(2px)' }}
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[60vh] bg-surface rounded-t-[32px] z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 overflow-hidden"
          >
             {/* Handle */}
             <div className="w-full flex justify-center pt-3 pb-1 shrink-0" onClick={onClose}>
                <div className="w-10 h-1 bg-white/20 rounded-full" />
             </div>

             {/* Swipable Content Area */}
             <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={article.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={onDragEnd}
                        className="absolute inset-0 flex flex-col h-full bg-surface"
                    >
                        {/* Header Info */}
                        <div className="px-6 pt-2 pb-4 flex items-end justify-between border-b border-white/5">
                            <div>
                                <h2 className="text-3xl font-serif text-white">{article.date}</h2>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">
                                    {new Date().toLocaleString('en-US', { month: 'long' })}
                                </p>
                            </div>
                            {/* Tiny preview of image */}
                            <div className="w-12 h-12 rounded bg-cover bg-center" style={{ backgroundImage: `url(${article.imageUrl})` }} />
                        </div>

                        {/* Chat / Content */}
                        <div className="flex-1 overflow-y-auto p-6 pb-20">
                            {messages.map((msg, i) => (
                                <div key={i} className={clsx("mb-4 p-3 rounded-2xl text-sm max-w-[85%]", msg.role === 'ai' ? "bg-white/5 text-white/90 rounded-tl-none" : "bg-gold/10 text-gold ml-auto rounded-tr-none")}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-white/5">
                             <div className="flex gap-3">
                                 <input 
                                    className="flex-1 bg-white/5 rounded-full px-4 text-sm text-white h-10 focus:ring-1 focus:ring-gold outline-none" 
                                    placeholder="Reply..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                 />
                                 <button onClick={handleSend} className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-midnight">
                                     <Send size={16} />
                                 </button>
                             </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Page ---
export default function Desk() {
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [emptyDays, setEmptyDays] = useState(0);

  useEffect(() => {
    // Init Data
    const today = new Date();
    setEmptyDays(new Date(today.getFullYear(), today.getMonth(), 1).getDay());
    
    const photos = [
        "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=300",
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=300",
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    ];

    setArticles(Array.from({ length: 30 }, (_, i) => ({
        id: `art-${i + 1}`,
        date: i + 1,
        imageUrl: photos[i % photos.length],
        richness: 0,
        issueId: i >= 5 && i <= 8 ? "issue-1" : undefined
    })));

    setIssues([{ 
        id: "issue-1", number: "01", title: "Midnight Solitude", theme: "Essay", 
        coverGradient: "bg-gradient-to-br from-gray-800 to-black" 
    }]);
  }, []);

  const handleNavigate = (dir: number) => {
      if (!currentArticle) return;
      const idx = articles.findIndex(a => a.id === currentArticle.id);
      const newIdx = idx + dir;
      if (newIdx >= 0 && newIdx < articles.length) {
          setCurrentArticle(articles[newIdx]);
      }
  };

  const highlightedIssueId = currentArticle?.issueId || null;

  return (
    <div className="min-h-screen bg-midnight text-paper font-sans flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <header className="px-6 pt-10 flex justify-between items-end z-20">
        <div>
           <h1 className="font-serif text-2xl text-white">The Desk</h1>
           <p className="text-[10px] text-gold uppercase tracking-[0.2em] opacity-80 mt-1">Life Log Magazine</p>
        </div>
      </header>

      {/* Gallery (Upper) */}
      <Gallery 
         issues={issues} 
         activeIssueId={activeIssueId} 
         onSelectIssue={(id: string|null) => {setActiveIssueId(id); setSelectedIds([])}} 
         highlightIssueId={highlightedIssueId}
      />

      {/* Calendar (Center) */}
      <div className="flex-1 relative z-10">
         <Calendar 
            articles={articles}
            activeIssueId={activeIssueId}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onOpenEditor={setCurrentArticle}
            emptyDays={emptyDays}
         />
         
         {/* AI Board (Bottom) - Always visible if not selecting */}
         {selectedIds.length === 0 && !activeIssueId && <AIBoard />}

         {/* Create Issue Action */} 
         <AnimatePresence>
             {selectedIds.length > 0 && (
                 <motion.div 
                    initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                    className="fixed bottom-6 left-0 right-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                 >
                     <motion.div initial={{height:0}} animate={{height:40}} className="w-[1px] bg-gold mb-2" />
                     <button className="pointer-events-auto bg-gold text-midnight px-8 py-3 rounded-full font-serif font-bold shadow-gold-glow flex items-center gap-2">
                         <Sparkles size={16} /> Create Issue
                     </button>
                 </motion.div>
             )}
         </AnimatePresence>
      </div>

      {/* Swipeable Half Sheet */}
      <SwipeableSheet 
         isOpen={!!currentArticle}
         onClose={() => setCurrentArticle(null)}
         article={currentArticle}
         onNavigate={handleNavigate}
         onUpdateRichness={() => {}}
      />
      
    </div>
  );
}