"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Grid3X3, Type, PenTool, Calendar as CalendarIcon, X } from 'lucide-react';
import { Page } from '../types/schema';
import { mapAssetsToExcalidrawFiles, extractPageDataFromExcalidraw} from '../utils/excalidrawMapper';

// --- Excalidraw Dynamic Import ---
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-stone-50 animate-pulse" />,
  }
);

// --- Constants & Helpers ---
const FRAME_ID = "__PAGE_FRAME__";
const FRAME_W = 900;
const FRAME_H = 1200;

function ensureFrame(elements: readonly any[]) {
  const found = elements.find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  if (found) {
    const patched = elements.map((el: any) => {
      if (el?.id !== FRAME_ID) return el;
      return {
        ...el,
        locked: true,
        isDeleted: false,
        width: FRAME_W,
        height: FRAME_H,
        backgroundColor: "transparent",
        strokeColor: "#e5e7eb",
        strokeWidth: 2,
        strokeStyle: "solid",
      };
    });
    return { elements: patched, frame: found };
  }
  const frame = {
    type: "rectangle",
    id: FRAME_ID, x: 0, y: 0, width: FRAME_W, height: FRAME_H,
    angle: 0, strokeColor: "#e5e7eb", backgroundColor: "transparent",
    fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
    roughness: 0, opacity: 100, locked: true,
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

// --------------------------------------------------------
// Sub Component: Text Editor Panel
// --------------------------------------------------------
const TextEditorPanel = ({
  pageData,
  onChange,
  onClose,
}: {
  pageData: { title: string; note: string; date: string };
  onChange: (key: string, value: string) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full rounded-t-[32px] shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Editing Text
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg hover:bg-slate-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
            <Check size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 bg-[#F9F8F6]">
          
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest">
              <CalendarIcon size={12} /> Date
            </label>
            <input
              type="date"
              value={pageData.date}
              onChange={(e) => onChange("date", e.target.value)}
              className="w-full bg-white rounded-xl p-3 text-lg font-bold text-gray-700 shadow-sm border-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest">
              <Type size={12} /> Title
            </label>
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full bg-transparent text-2xl font-serif font-bold text-gray-800 border-b border-gray-200 focus:border-slate-800 focus:outline-none py-2 transition-colors placeholder-gray-300"
              placeholder="Untitled Page"
            />
          </div>

          {/* Note Textarea */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-widest">
              <PenTool size={12} /> Note
            </label>
            <textarea
              value={pageData.note}
              onChange={(e) => onChange("note", e.target.value)}
              className="w-full h-64 bg-white rounded-2xl p-5 text-base font-sans leading-relaxed text-gray-700 shadow-sm border-none resize-none focus:ring-2 focus:ring-slate-200 transition-all placeholder-gray-300"
              placeholder="Write your story here..."
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};


// --------------------------------------------------------
// Sub Component: Canvas Editor Panel (Full Screen)
// --------------------------------------------------------
const CanvasEditorPanel = ({
  initialSceneData,
  initialAssets,
  onSaveScene,
  onClose,
}: {
  initialSceneData: any;
  initialAssets: Record<string, any>;
  onSaveScene: (scene: any, assets: any) => void; // <--- assets追加
  onClose: () => void;
}) => {
  const [gridOn, setGridOn] = useState(true);
  const [api, setApi] = useState<any>(null);

  // 初期データ構築
  const initialData = useMemo(() => {
    const rawElements = initialSceneData?.elements || [];
    const withFrame = ensureFrame(rawElements);
    return {
      elements: withFrame.elements,
      appState: {
        ...initialSceneData?.appState,
        viewBackgroundColor: "#fafafa",
        collaborators: new Map(),
      },
      files: mapAssetsToExcalidrawFiles(initialAssets),
    };
  }, [initialSceneData, initialAssets]);

  // 編集中の最新データを保持するRef
  const draftRef = useRef<any>(initialData);

  // マウント時フィット
  useEffect(() => {
    if (api) fitToFrame(api, initialData.elements);
  }, [api, initialData]);

  const handleDone = () => {
    // APIから最新データを取得
    // draftRefはonChangeで更新されていますが、files（画像）はAPIから取ったほうが確実な場合があります
    // ここでは api.getFiles() を使うのが安全です
    if (!api) {
       onClose();
       return;
    }

    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles(); // <--- 画像ファイル群

    // ★重要: 画像データを抽出・変換
    // extractPageDataFromExcalidraw を使って、ExcalidrawのfilesをAssetRef形式に変換
    const extracted = extractPageDataFromExcalidraw(elements, appState, files);
    
    // 枠線の保証（既存ロジック）
    const ensured = ensureFrame(extracted.sceneData.elements ?? []);

    // 親へ保存通知
    onSaveScene(
      {
        elements: ensured.elements,
        appState: {
          viewBackgroundColor: extracted.sceneData.appState?.viewBackgroundColor,
          collaborators: new Map(),
        }
      },
      extracted.assets // <--- 新しいアセット（画像）も渡す
    );

    onClose();
  };


  return (
    <div className="fixed inset-0 z-[100] bg-[#F9F8F6] flex flex-col">
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
             <X size={20} />
           </button>
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Editing Canvas</span>
             <span className="text-sm font-bold text-gray-800">Decorate</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button
             type="button"
             onClick={() => setGridOn(v => !v)}
             className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${gridOn ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
           >
             <Grid3X3 size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Grid</span>
           </button>

           <button
             onClick={handleDone}
             className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full active:scale-95 transition-all shadow-md hover:bg-slate-800"
           >
             <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
             <Check size={16} />
           </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full h-full relative overflow-hidden p-4">
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
          <Excalidraw
            initialData={initialData as any}
            excalidrawAPI={(apiObj: any) => setApi(apiObj)}
            theme="light"
            gridModeEnabled={gridOn}
            // 変更があるたびにRefを更新（再レンダリングさせない）
            onChange={(elements: any, appState: any, files: any) => {
              const ensured = ensureFrame(elements);
              draftRef.current = { elements: ensured.elements, appState, files };
            }}
            UIOptions={{
              canvasActions: {
                toggleTheme: false,
                changeViewBackgroundColor: true,
                clearCanvas: true,
                saveToActiveFile: false,
                loadScene: false,
                saveAsImage: false,
                export: false,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};


// --------------------------------------------------------
// Main Component: PageCanvasEditor
// --------------------------------------------------------

interface PageCanvasEditorProps {
  initialPage: Page;
  focusTarget?: 'meta' | 'canvas';
  onSave: (updatedPage: Partial<Page>) => void;
  onClose?: () => void;
}

export const PageCanvasEditor: React.FC<PageCanvasEditorProps> = ({ 
  initialPage, 
  focusTarget = 'canvas', 
  onSave,
  onClose
}) => {
  // Local State for Meta Data
  const [metaData, setMetaData] = useState({
    title: initialPage.title || "",
    note: initialPage.note || "",
    date: initialPage.date,
  });

  // Local State for Scene Data
  // (We don't need detailed state here, just keep the initial one until saving)
  const [sceneData, setSceneData] = useState(initialPage.sceneData);

  // Active Mode ('meta' | 'canvas' | null)
  // 初期表示時にfocusTargetを開く
  const [activeMode, setActiveMode] = useState<'meta' | 'canvas' | null>(focusTarget);


  const [sceneUpdateCount, setSceneUpdateCount] = useState(0);

  const [assetsData, setAssetsData] = useState(initialPage.assets);

  // Save Handlers
  const handleSaveMeta = () => {
    // メタデータのみ一時保存（まだ確定しない）
    // 本格的に保存する場合はここでonSaveを呼んでも良いが、
    // 今回は「モードを閉じる＝一時保存」とする
    setActiveMode(null);
  };

  const handleSaveScene = (updatedScene: any, updatedAssets: any) => {
    setSceneData(updatedScene);
    setAssetsData(updatedAssets); // <--- アセットも更新
    setActiveMode(null);
    setSceneUpdateCount(prev => prev + 1);

  };
  
  // 最終的な保存処理（親へ通知して閉じる）
  const handleFinalSave = () => {
    onSave({
      ...metaData,
      sceneData: sceneData,
      assets: assetsData, // <--- 保存データに含める

    });
    onClose?.();
  };

  return (
    <>
      {/* 
        Base View (Preview Mode in Editor)
        編集モードが閉じた状態ではプレビューを表示し、
        「完了」ボタンや再度編集を開くトリガーを提供する
      */}
      <div className="h-full flex flex-col bg-gray-50">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
           <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800">
             Close
           </button>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</span>
           <button onClick={handleFinalSave} className="text-sm font-bold text-blue-600 hover:text-blue-800">
             Save All
           </button>
        </div>

        <div className="flex-1 p-4 overflow-hidden flex justify-center items-center">
          {/* 
             簡易プレビューとして PageCanvasPreview を再利用。
             一時保存されたデータ(metaData, sceneData)を渡して表示する。
          */}
          <div className="w-full max-w-md h-full shadow-lg rounded-xl overflow-hidden pointer-events-auto">
             {/* 
               注意: PageCanvasPreviewはinitialPageをpropsで受け取る設計なので、
               一時的なオブジェクトを作って渡す
             */}
             {/* @ts-ignore : 簡易的なキャスト */}
             <div className="w-full h-full pointer-events-auto">
                <PageCanvasEditorPreviewStub 
                   key={sceneUpdateCount}
                   page={{...initialPage, ...metaData, sceneData}} 
                   onEditCanvas={() => setActiveMode('canvas')}
                   onEditMeta={() => setActiveMode('meta')}
                />
             </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeMode === 'meta' && (
          <TextEditorPanel 
            pageData={metaData}
            onChange={(key, val) => setMetaData(prev => ({ ...prev, [key]: val }))}
            onClose={handleSaveMeta}
          />
        )}
        
        {activeMode === 'canvas' && (
          <CanvasEditorPanel
            initialSceneData={sceneData}
            initialAssets={assetsData}
            onSaveScene={handleSaveScene}
            onClose={() => setActiveMode(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// 循環参照回避のための簡易スタブ（Previewコンポーネントをインポートしてもよいが、ファイル分割の関係でここに簡易版を置くか、本物をインポートするか）
// 今回は PageCanvasPreview をインポートして使う形が綺麗だが、ファイル間の循環依存に注意。
// ここでは、既に作成済みの components/PageCanvasPreview を使う想定で実装する。
import { PageCanvasPreview } from './PageCanvasPreview';

const PageCanvasEditorPreviewStub = ({ page, onEditCanvas, onEditMeta }: any) => {
  return (
    <PageCanvasPreview 
      page={page} 
      onEditCanvas={onEditCanvas}
      onEditHeader={onEditMeta}
      className="h-full w-full border-none shadow-none rounded-none"
    />
  );
};