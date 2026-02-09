"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Type, Calendar as CalendarIcon } from 'lucide-react';
import { Schedule } from '@/types/schema';
import { ScheduleCanvasPreview } from './ScheduleCanvasPreview';
// ★共通化したコンポーネントをインポート
import { CanvasEditorPanel } from '@/components/canvas/CanvasEditorPanel';

// ------------------------------------------------------------------
// Sub Panel: Meta Editor (Title, Date, Type)
// ------------------------------------------------------------------
const MetaEditorPanel = ({ schedule, onChange, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white w-full rounded-t-[32px] shadow-2xl relative z-10 h-[50vh] flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Settings</span>
          <button onClick={onClose} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg hover:bg-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest">Done</span><Check size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest"><Type size={12} /> Title</label>
            <input type="text" value={schedule.title} onChange={(e) => onChange("title", e.target.value)} className="w-full bg-white rounded-xl p-3 text-lg font-bold text-gray-700 shadow-sm border-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 opacity-60 pointer-events-none">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest"><CalendarIcon size={12} /> Start Date</label>
                <input type="date" value={schedule.startDate} readOnly className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold text-gray-500 shadow-sm border-none" />
             </div>
             <div className="space-y-2 opacity-60 pointer-events-none">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest">Type</label>
                <input type="text" value={schedule.type} readOnly className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold text-gray-500 shadow-sm border-none capitalize" />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ------------------------------------------------------------------
// Main Component: ScheduleEditor
// ------------------------------------------------------------------
interface ScheduleEditorProps {
  initialSchedule: Schedule;
  focusTarget?: 'meta' | 'canvas';
  onSave: (updatedSchedule: Partial<Schedule>) => void;
  onClose?: () => void;
}

const ScheduleEditorBase: React.FC<ScheduleEditorProps> = ({ 
  initialSchedule, focusTarget = 'canvas', onSave, onClose
}) => {
  const [metaData, setMetaData] = useState({ 
    title: initialSchedule.title || "", 
    startDate: initialSchedule.startDate,
    type: initialSchedule.type,
  });
  const [sceneData, setSceneData] = useState(initialSchedule.sceneData);
  const [assetsData, setAssetsData] = useState(initialSchedule.assets);
  
  const [activeMode, setActiveMode] = useState<'meta' | 'canvas' | null>(focusTarget);
  const [updateCount, setUpdateCount] = useState(0);

  const handleSaveMeta = () => setActiveMode(null);
  const handleSaveScene = (updatedScene: any, updatedAssets: any) => {
    setSceneData(updatedScene);
    setAssetsData(updatedAssets);
    setActiveMode(null);
    setUpdateCount(p => p + 1);
  };
  
  const handleFinalSave = () => {
    onSave({ ...metaData, sceneData, assets: assetsData });
    onClose?.();
  };

  const previewSchedule = useMemo(() => ({
     ...initialSchedule, ...metaData, sceneData, assets: assetsData, updatedAt: new Date().toISOString()
  }), [initialSchedule, metaData, sceneData, assetsData, updateCount]);

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 shrink-0">
           <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2 py-1">Close</button>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule Preview</span>
           <button onClick={handleFinalSave} className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full transition-colors">Save All</button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-hidden flex justify-center items-center">
          <div className="w-full max-w-[800px] h-full shadow-xl rounded-xl overflow-hidden ring-1 ring-gray-900/5 bg-white relative group cursor-pointer"
               onClick={() => setActiveMode('canvas')}
          >
             <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMode('meta'); }}
                  className="bg-white/90 backdrop-blur border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Settings
                </button>
             </div>
             
             {/* プレビュー表示 */}
             <ScheduleCanvasPreview 
               schedule={previewSchedule} 
               onClick={() => setActiveMode('canvas')}
             />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeMode === 'meta' && (
          <MetaEditorPanel 
            schedule={metaData} 
            onChange={(key: string, val: string) => setMetaData(p => ({ ...p, [key]: val }))} 
            onClose={handleSaveMeta}
          />
        )}
        {activeMode === 'canvas' && (
          <CanvasEditorPanel
            initialSceneData={sceneData} 
            initialAssets={assetsData} 
            onSaveScene={handleSaveScene} 
            onClose={() => setActiveMode(null)}
            title="Editing Schedule"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const ScheduleEditor = React.memo(ScheduleEditorBase, (prev, next) => {
  return prev.initialSchedule.id === next.initialSchedule.id;
});