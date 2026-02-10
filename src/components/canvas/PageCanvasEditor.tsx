"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Grid3X3, Type, PenTool, Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';
import { Page } from '@/types/schema';
import { mapAssetsToExcalidrawFiles, extractPageDataFromExcalidraw } from '@/utils/excalidrawMapper';
import { useExcalidrawFiles } from '@/hooks/useExcalidrawFiles';
import { CanvasEditorPanel } from '@/components/canvas/CanvasEditorPanel';

// Previewコンポーネントのインポート
import { PageCanvasPreview } from './PageCanvasPreview';


const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-50" /> }
);

// --- Constants & Helpers (前回と同じ) ---
const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;

function ensureFrame(elements: readonly any[]) {
  const found = elements.find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  if (found) {
    const patched = elements.map((el: any) => {
      if (el?.id !== FRAME_ID) return el;
      return {
        ...el, locked: true, isDeleted: false, width: FRAME_W, height: FRAME_H,
        backgroundColor: "transparent", strokeColor: "#e5e7eb", strokeWidth: 2, strokeStyle: "solid",
      };
    });
    return { elements: patched, frame: found };
  }
  const frame = {
    type: "rectangle", id: FRAME_ID, x: 0, y: 0, width: FRAME_W, height: FRAME_H,
    angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent", fillStyle: "solid",
    strokeWidth: 2, strokeStyle: "solid", roughness: 0, opacity: 100, locked: true,
    version: 1, isDeleted: false,
  };
  return { elements: [frame, ...elements], frame };
}

function fitToFrame(api: any, elements: readonly any[]) {
  if (!api) return;
  const frame = elements.find((el: any) => el?.id === FRAME_ID);
  const target = frame ? [frame] : api.getSceneElements?.() ?? undefined;
  requestAnimationFrame(() => {
    if (target) api.scrollToContent(target, { fitToContent: true });
  });
}

// --- TextEditorPanel (前回と同じなので省略可ですが、念のため記述) ---
const TextEditorPanel = ({ pageData, onChange, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white w-full rounded-t-[32px] shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Editing Text</span>
          <button onClick={onClose} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg hover:bg-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
            <Check size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 bg-[#F9F8F6]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest"><CalendarIcon size={12} /> Date</label>
            <input type="date" value={pageData.date} onChange={(e) => onChange("date", e.target.value)} className="w-full bg-white rounded-xl p-3 text-lg font-bold text-gray-700 shadow-sm border-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest"><Type size={12} /> Title</label>
            <input type="text" value={pageData.title} onChange={(e) => onChange("title", e.target.value)} className="w-full bg-transparent text-2xl font-serif font-bold text-gray-800 border-b border-gray-200 focus:border-slate-800 focus:outline-none py-2 transition-colors placeholder-gray-300" placeholder="Untitled Page" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest"><PenTool size={12} /> Note</label>
            <textarea value={pageData.note} onChange={(e) => onChange("note", e.target.value)} className="w-full h-64 bg-white rounded-2xl p-5 text-base font-sans leading-relaxed text-gray-700 shadow-sm border-none resize-none focus:ring-2 focus:ring-slate-200 transition-all placeholder-gray-300" placeholder="Write your story here..." />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main PageCanvasEditor ---
interface PageCanvasEditorProps {
  initialPage: Page;
  focusTarget?: 'meta' | 'canvas';
  onSave: (updatedPage: Partial<Page>) => void;
  onClose?: () => void;
  onDelete?: (pageId: string) => void; // ★追加

}

const PageCanvasEditorBase: React.FC<PageCanvasEditorProps> = ({ 
  initialPage, focusTarget = null, onSave, onClose, onDelete
}) => {
  const [metaData, setMetaData] = useState({ title: initialPage.title || "", note: initialPage.note || "", date: initialPage.date });
  const [sceneData, setSceneData] = useState(initialPage.sceneData);
  const [activeMode, setActiveMode] = useState<'meta' | 'canvas' | null>(focusTarget);
  const [assetsData, setAssetsData] = useState(initialPage.assets);
  const [updateCount, setUpdateCount] = useState(0); // プレビュー更新用

  const handleSaveMeta = () => setActiveMode(null);
  const handleSaveScene = (updatedScene: any, updatedAssets: any) => {
    setSceneData(updatedScene);
    setAssetsData(updatedAssets);
    setActiveMode(null);
    setUpdateCount(p => p + 1); // 強制再レンダリング
  };
  
  const handleFinalSave = () => {
    onSave({ ...metaData, sceneData, assets: assetsData });
    onClose?.();
  };

    const handleDelete = () => {
    if (!onDelete) return;
    if (window.confirm("Are you sure you want to delete this page?")) {
      onDelete(initialPage.id);
      onClose?.();
    }
  };


  const previewPage = useMemo(() => ({
     ...initialPage, ...metaData, sceneData, assets: assetsData, updatedAt: new Date().toISOString()
  }), [initialPage, metaData, sceneData, assetsData, updateCount]);



  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center gap-2">
             <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2 py-1">Close</button>
             {/* ★追加: 削除ボタン */}
             {onDelete && (
               <button 
                 onClick={handleDelete}
                 className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                 title="Delete Page"
               >
                 <Trash2 size={18} />
               </button>
             )}
           </div>


           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</span>
           <button onClick={handleFinalSave} className="text-sm font-bold text-blue-600 hover:text-blue-800">Save All</button>
        </div>
        <div className="flex-1 p-4 overflow-hidden flex justify-center items-center">
          <div className="w-full max-w-md h-[80vh] shadow-lg rounded-xl overflow-hidden pointer-events-auto">
             <PageCanvasPreview 
               key={updateCount} // 更新のたびにリセット
               page={previewPage} 
               onEditCanvas={() => setActiveMode('canvas')}
               onEditHeader={() => setActiveMode('meta')}
             />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeMode === 'meta' && (
          <TextEditorPanel 
            pageData={metaData} onChange={(key: string, val: string) => setMetaData(p => ({ ...p, [key]: val }))} onClose={handleSaveMeta}
          />
        )}
        {activeMode === 'canvas' && (
          <CanvasEditorPanel
            initialSceneData={sceneData} initialAssets={assetsData} onSaveScene={handleSaveScene} onClose={() => setActiveMode(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const PageCanvasEditor = React.memo(PageCanvasEditorBase, (prev, next) => {
  return prev.initialPage.id === next.initialPage.id;
});