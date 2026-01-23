"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  LayoutGrid,
  Upload,
  X,
  Sparkles,
  Check,
  Wand2,
  ArrowRight,
  Maximize2,
  Download
} from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface MagazineConfig {
    title: string;
    verticalText: string;
    mainHeading: string;
    subHeading: string;
    issueDate: string;
}

interface LibraryItem {
    id: number;
    url: string;
    date: string;
}

type FlowState = 'idle' | 'selected' | 'generating' | 'complete';

// --- Mock Data ---
const MOCK_GENERATED_RESULT = "https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?w=800&q=80";

const INITIAL_LIBRARY: LibraryItem[] = [
    { id: 1, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", date: "OCT 12" },
    { id: 2, url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80", date: "OCT 14" },
    { id: 3, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", date: "OCT 18" },
    { id: 4, url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80", date: "OCT 21" },
];

const DEFAULT_MAGAZINE_CONFIG: MagazineConfig = {
    title: "VOGUE",
    verticalText: "私という\n現象。",
    mainHeading: "Be the Star.",
    subHeading: "Feature Model",
    issueDate: "OCT"
};

// --- Components ---

/**
 * 1. Step Indicator
 */
const StepIndicator = ({ step }: { step: FlowState }) => {
    const steps = [
        { id: 'idle', label: 'Photo' },
        { id: 'generating', label: 'AI Process' },
        { id: 'complete', label: 'Magazine' }
    ];

    const getCurrentIndex = () => {
        if (step === 'idle' || step === 'selected') return 0;
        if (step === 'generating') return 1;
        return 2;
    };

    const activeIndex = getCurrentIndex();

    return (
        <div className="flex items-center justify-center gap-2 mb-8 px-6">
            {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center">
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all duration-500",
                        idx === activeIndex 
                            ? "border-red-700 bg-red-700 text-white shadow-md" 
                            : idx < activeIndex
                                ? "border-red-700/20 text-red-700 bg-red-50"
                                : "border-stone-200 text-stone-300 bg-transparent"
                    )}>
                        {idx < activeIndex ? <Check size={10} /> : <span>0{idx + 1}</span>}
                        <span>{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={clsx("w-6 h-[1px] mx-1 transition-colors duration-500", idx < activeIndex ? "bg-red-700/30" : "bg-stone-200")} />
                    )}
                </div>
            ))}
        </div>
    );
};

/**
 * 2. Upload / Preview Area
 */
interface UploadAreaProps {
    flowState: FlowState;
    sourceImage: string | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStartGeneration: () => void;
}

const UploadArea = ({ flowState, sourceImage, onUpload, onStartGeneration }: UploadAreaProps) => {
    if (flowState === 'generating' || flowState === 'complete') return null;

    return (
        <div className="w-full px-6 mb-8">
            <AnimatePresence mode="wait">
                {flowState === 'idle' ? (
                    <motion.label 
                        key="upload"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="block w-full aspect-[3/2] border border-dashed border-stone-300 bg-stone-100/50 rounded-sm cursor-pointer hover:bg-red-50/30 hover:border-red-700/30 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 group-hover:text-red-700 transition-colors">
                            <Upload size={24} className="mb-3" />
                            <span className="text-xs font-serif uppercase tracking-widest">Select Portrait</span>
                            <span className="text-[9px] mt-1 opacity-50">Or drop image here</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                    </motion.label>
                ) : (
                    <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full"
                    >
                        <div className="aspect-[3/2] w-full overflow-hidden bg-stone-200 relative shadow-inner border border-stone-200">
                            <img src={sourceImage!} alt="Source" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-stone-900/10" />
                            <div className="absolute bottom-2 left-3 bg-black/50 text-white text-[9px] px-2 py-0.5 backdrop-blur-sm">ORIGINAL</div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            <label className="flex-1 py-3 border border-stone-200 text-stone-500 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-stone-50 cursor-pointer transition-colors">
                                <Camera size={14} /> Retake
                                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                            </label>
                            <button 
                                onClick={onStartGeneration}
                                className="flex-[2] py-3 bg-red-700 text-white text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:bg-red-800 transition-all active:scale-[0.98]"
                            >
                                <Wand2 size={14} /> Generate Cover
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 3. Processing State
 */
const ProcessingState = () => (
    <div className="w-full aspect-[3/4] max-w-sm mx-auto flex flex-col items-center justify-center text-center px-6">
        <div className="relative">
            <div className="w-16 h-16 border-2 border-stone-100 border-t-red-700 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={16} className="text-red-700 animate-pulse" />
            </div>
        </div>
        <h3 className="mt-6 text-lg font-serif italic text-stone-800">Designing Layout...</h3>
        <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2 animate-pulse">
            Analyzing Features • Matching Typography
        </p>
    </div>
);

/**
 * 4. Magazine Cover (Result)
 */
const MagazineCover = ({ image, config, onSave }: { image: string, config: MagazineConfig, onSave: () => void }) => {
    return (
        <div className="w-full relative z-10 px-6 pb-8">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[140px] font-serif font-black text-stone-200/50 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter leading-none opacity-40">
                {config.title}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="relative w-full aspect-[3/4] max-w-sm mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white p-1.5 group"
            >
                <div className="relative w-full h-full overflow-hidden bg-stone-100">
                    <img src={image} className="w-full h-full object-cover filter contrast-[1.05]" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="bg-red-700 text-white text-[9px] font-bold px-3 py-1 tracking-[0.2em] uppercase shadow-sm">Special Issue</div>
                            <div className="text-right mix-blend-difference text-white">
                                <span className="block text-4xl font-serif leading-none opacity-90">{config.issueDate}</span>
                            </div>
                        </div>
                        <div className="absolute top-24 left-6 [writing-mode:vertical-rl] text-white drop-shadow-md space-y-6">
                            <p className="text-3xl font-serif font-bold tracking-widest text-white whitespace-pre-wrap leading-relaxed drop-shadow-lg">{config.verticalText}</p>
                        </div>
                        <div className="text-right space-y-2 pb-8">
                            <h2 className="text-4xl font-serif text-white font-bold italic drop-shadow-lg">
                                <span className="text-red-500 block text-xs font-sans not-italic font-bold mb-1 tracking-[0.3em] uppercase drop-shadow-sm">{config.subHeading}</span>
                                {config.mainHeading}
                            </h2>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-sm mx-auto mt-6">
                <button 
                    onClick={onSave}
                    className="w-full py-4 bg-stone-900 text-white flex items-center justify-center gap-3 hover:bg-red-800 transition-colors shadow-xl group"
                >
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Save to Library</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

/**
 * 5. Library (Large Grid) with Modal
 */
const ModelArchive = ({ items }: { items: LibraryItem[] }) => {
    const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

    return (
        <div className="mt-8 px-6 pb-20">
            <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-2">
                <div className="flex items-center gap-3">
                    <LayoutGrid size={14} className="text-red-700" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">Model Archive</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">{items.length} ISSUES</span>
            </div>
            
            {/* Grid Layout (2 Columns, 3:4 Aspect) */}
            <div className="grid grid-cols-2 gap-4">
                {/* Upload Trigger Placeholder (Optional) */}
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="aspect-[3/4] border border-dashed border-stone-300 flex flex-col items-center justify-center gap-3 hover:bg-stone-100 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                        <Upload size={18} className="text-stone-400 group-hover:text-red-700" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">New Issue</span>
                </button>

                {items.map((item) => (
                    <motion.div
                        layoutId={`card-${item.id}`}
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="relative aspect-[3/4] bg-stone-200 cursor-pointer overflow-hidden group shadow-sm hover:shadow-lg transition-all border border-stone-200"
                    >
                        <img src={item.url} alt={`Issue ${item.id}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        
                        {/* Overlay Info */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
                            <span className="text-[8px] font-mono text-white/90 bg-black/30 px-1.5 py-0.5 backdrop-blur-sm">VOL.0{item.id}</span>
                            <Maximize2 size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div 
                            layoutId={`card-${selectedItem.id}`}
                            className="relative w-full max-w-sm bg-white p-2 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
                            >
                                <X size={24} />
                            </button>

                            {/* Image */}
                            <div className="aspect-[3/4] w-full bg-stone-100 relative overflow-hidden">
                                <img src={selectedItem.url} className="w-full h-full object-cover" />
                                
                                {/* Simple Overlay for Context */}
                                <div className="absolute top-4 left-4 border-l-2 border-red-700 pl-3">
                                    <span className="block text-white text-2xl font-serif font-bold drop-shadow-md">VOGUE</span>
                                    <span className="text-[10px] text-white/90 uppercase tracking-widest drop-shadow-md">{selectedItem.date}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-3 px-2 pb-1">
                                <div className="text-xs font-mono text-stone-500">VOL.0{selectedItem.id}</div>
                                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:text-red-700 transition-colors">
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


// --- Main Page ---

export default function CharacterStagePage() {
    const [flowState, setFlowState] = useState<FlowState>('idle');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [library, setLibrary] = useState<LibraryItem[]>(INITIAL_LIBRARY);
    
    // Config for the magazine
    const config = DEFAULT_MAGAZINE_CONFIG;

    // 1. Handle File Upload
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setSourceImage(objectUrl);
            setFlowState('selected');
        }
    };

    // 2. Start AI Generation
    const startGeneration = () => {
        setFlowState('generating');
        setTimeout(() => {
            setFinalImage(MOCK_GENERATED_RESULT);
            setFlowState('complete');
        }, 3000);
    };

    // 3. Save to Library and Reset
    const saveToLibrary = () => {
        if (finalImage) {
            const newId = library.length + 1;
            setLibrary([{ id: newId, url: finalImage, date: "JUST NOW" }, ...library]);
            setFlowState('idle');
            setSourceImage(null);
            setFinalImage(null);
            // Scroll to library (optional UX)
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-red-100 selection:text-red-900 pb-10 relative overflow-x-hidden">
        
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

            <main className="relative pt-0 max-w-lg mx-auto">
                
                {/* 1. Progress Visualization */}
                <StepIndicator step={flowState} />

                {/* 2. Upload / Confirmation Area */}
                <UploadArea 
                    flowState={flowState} 
                    sourceImage={sourceImage}
                    onUpload={handleUpload}
                    onStartGeneration={startGeneration}
                />

                {/* 3. Main Stage: Either Processing or Result */}
                <div className="min-h-[100px]">
                    <AnimatePresence mode="wait">
                        {flowState === 'generating' && (
                            <motion.div key="processing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <ProcessingState />
                            </motion.div>
                        )}

                        {flowState === 'complete' && finalImage && (
                            <motion.div key="result">
                                <MagazineCover 
                                    image={finalImage} 
                                    config={config} 
                                    onSave={saveToLibrary}
                                />
                            </motion.div>
                        )}
                        
                        {(flowState === 'idle' || flowState === 'selected') && (
                            <div className="w-full h-12 flex items-center justify-center opacity-20">
                                <div className="h-px bg-stone-400 w-1/3" />
                                <span className="mx-4 text-[9px] uppercase tracking-widest font-serif">Studio Floor</span>
                                <div className="h-px bg-stone-400 w-1/3" />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Library Archive (New Grid Layout) */}
                <ModelArchive items={library} />
                
                {/* Footer */}
                <div className="text-center pb-8 opacity-30 mt-10">
                    <Sparkles size={16} className="mx-auto text-stone-400 mb-2" />
                    <p className="text-[9px] uppercase tracking-[0.4em] text-stone-500 font-serif">Life is Journal</p>
                </div>

            </main>
        </div>
    );
}