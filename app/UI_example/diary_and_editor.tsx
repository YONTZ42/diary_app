"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Check, Grid3X3, Type, PenTool, Palette, Star } from "lucide-react";

/**
 * Article（あなた指定）
 */
export type Article = {
  id: string;
  date: number;
  imageUrl: string;
  title?: string;
  content?: string;
  color?: string;
  rating?: number;
  issueId?: string;
};

/**
 * ローカル保存/DB保存向けの安全なシーン形式
 */
export type PersistedScene = {
  elements: readonly any[];
  files?: any;
  appState?: {
    viewBackgroundColor?: string;
  };
} | null;

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-stone-100 animate-pulse" />
    ),
  }
);



// =====================
// Frame settings
// =====================
const FRAME_ID = "__DIARY_PREVIEW_FRAME__";
// 3:4 に合わせる（DiaryPreview aspect 3/4）
const FRAME_W = 900;
const FRAME_H = 1200;

// =====================
// Helpers
// =====================

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return {
    year: d.getFullYear(),
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString().padStart(2, "0"),
  };
};

export function sanitizeSceneForStorage(raw: any): PersistedScene {
  if (!raw) return null;
  return {
    elements: raw.elements ?? [],
    files: raw.files ?? {},
    appState: {
      viewBackgroundColor: raw.appState?.viewBackgroundColor ?? "#fcfaf8",
    },
  };
}

function toExcalidrawInitialData(scene: PersistedScene) {
  return {
    elements: scene?.elements ?? [],
    files: scene?.files ?? {},
    appState: {
      viewBackgroundColor: scene?.appState?.viewBackgroundColor ?? "#fcfaf8",
      // collaborators は Map を期待されるので必ず Map
      collaborators: new Map(),
    },
  };
}

function createFrameElement(): any {
  const now = Date.now();
  return {
    type: "rectangle",
    id: FRAME_ID,
    x: 0,
    y: 0,
    width: FRAME_W,
    height: FRAME_H,
    angle: 0,
    strokeColor: "#111827",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    seed: now % 2147483647,
    version: 1,
    versionNonce: (now * 7) % 2147483647,
    isDeleted: false,
    updated: 1,
    groupIds: [],
    boundElements: null,
    locked: true,
    link: null,
    roundness: { type: 3, value: 16 },
  };
}

function ensureFrame(elements: readonly any[]): { elements: readonly any[]; frame: any } {
  const found = (elements ?? []).find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  if (found) {
    // 念のため locked とサイズを維持
    const patched = (elements ?? []).map((el: any) => {
      if (el?.id !== FRAME_ID) return el;
      return {
        ...el,
        locked: true,
        isDeleted: false,
        width: FRAME_W,
        height: FRAME_H,
        strokeWidth: 2,
        backgroundColor: "transparent",
      };
    });
    return { elements: patched, frame: found };
  }
  const frame = createFrameElement();
  return { elements: [frame, ...(elements ?? [])], frame };
}

// ExcalidrawAPI を使って「枠にフィット」
function fitToFrame(api: any, elements: readonly any[]) {
  if (!api) return;
  const frame = (elements ?? []).find((el: any) => el?.id === FRAME_ID && !el?.isDeleted);
  const target = frame ? [frame] : api.getSceneElements?.() ?? undefined;

  // タイミングにより top-left になることがあるので refresh + raf + timeout で堅めに
  requestAnimationFrame(() => {
    api.refresh?.();
    setTimeout(() => {
      try {
        api.scrollToContent?.(target, { fitToContent: true });
      } catch {
        // ignore
      }
    }, 0);
  });
}

// =====================
// 1) DiaryPreview
// =====================

export const DiaryPreview = memo(
  ({
    article,
    scene,
    onDrawClick,
    onTextClick,
    styleClass = "",
  }: {
    article: Article;
    scene: PersistedScene;
    onDrawClick?: () => void;
    onTextClick?: () => void;
    styleClass?: string;
  }) => {
    const accentColor = article.color || "#000000";
    const { year, month, day } = formatDate(article.date);

    const [gridOn, setGridOn] = useState(false);
    const [api, setApi] = useState<any>(null);

    const initialData = useMemo(() => {
      const base = toExcalidrawInitialData(scene);
      const withFrame = ensureFrame(base.elements);
      return { ...base, elements: withFrame.elements };
    }, [scene]);

    // 初回に「枠へフィット」して部分表示を解消
    useEffect(() => {
      if (!api) return;
      fitToFrame(api, initialData.elements);
      // eslint-disable-next-line react-hooks/exhaustive-deps
        const base = toExcalidrawInitialData(scene);
        const withFrame = ensureFrame(base.elements);

        // ExcalidrawはinitialDataでは更新されないので、updateSceneで差し替える
        api.updateScene?.({
          elements: withFrame.elements,
          appState: {
            ...base.appState,
            // viewModeプレビュー向け：ズレ防止のためここも固定しておくと安定
            collaborators: new Map(),
          },
          files: base.files,
        });

        // 枠へフィット（部分表示の解消）
        fitToFrame(api, withFrame.elements);
      
    }, [api, initialData.elements]);

    return (
      <div
        className={clsx(
          "relative bg-white shadow-xl flex flex-col overflow-hidden rounded-[2px] isolate transition-all duration-300",
          styleClass || "aspect-[3/4]"
        )}
      >
        {/* Header Overlay */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
          <div className="flex flex-col items-center bg-black/20 backdrop-blur-md p-1 px-2 rounded">
            <span className="text-[10px] font-mono font-bold text-white leading-none mb-1 opacity-80">
              {year}
            </span>
            <span className="text-4xl font-serif leading-none font-bold text-white">
              {day}
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mt-1 border-t border-white/40 pt-1">
              {month}
            </span>
          </div>

          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="white"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke={accentColor}
                strokeWidth="2"
                fill="none"
                strokeDasharray="88"
                strokeDashoffset={88 - (88 * (article.rating || 0)) / 100}
              />
            </svg>
            <span className="text-[8px] font-mono font-bold text-white">
              {article.rating ?? 0}
            </span>
          </div>
        </div>

        {/* 上：Draw Preview (70%) */}
        <div
          onClick={onDrawClick}
          className="h-[70%] min-h-[70%] w-full bg-[#fcfaf8] relative overflow-hidden z-10 border-b border-stone-100 cursor-pointer group/image"
        >
          {/* grid toggle button（クリック遮断レイヤより上） */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setGridOn((v) => !v);
            }}
            className="absolute right-3 bottom-3 z-[200] bg-white/90 backdrop-blur border border-stone-200 shadow-sm rounded-full px-3 py-2 flex items-center gap-2 active:scale-95 transition pointer-events-auto"
          >
            <Grid3X3 size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              GRID
            </span>
          </button>

          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 z-20 transition-colors " />

          <div className="w-full h-full relative exca-preview">
            <Excalidraw
              initialData={initialData as any}
              excalidrawAPI={(apiObj: any) => setApi(apiObj)}
              viewModeEnabled={true}
              zenModeEnabled={true}
              gridModeEnabled={gridOn}
              theme="light"
              UIOptions={{
                canvasActions: {
                  loadScene: false,
                  saveToActiveFile: false,
                  export: false,
                  saveAsImage: false,
                  clearCanvas: false,
                  toggleTheme: false,
                  changeViewBackgroundColor: false,
                },
              }}
            />
            {/* 操作遮断（カードクリック優先） */}
            <div className="absolute inset-0 z-[150] bg-transparent touch-none" />
          </div>
        </div>

        {/* 下：Text Preview (30%) */}
        <div
          onClick={onTextClick}
          className="h-[30%] min-h-[30%] p-4 relative bg-white z-20 flex flex-col justify-center cursor-pointer hover:bg-stone-50 transition-colors"
        >
          <div
            className="absolute left-4 top-4 bottom-4 w-[2px]"
            style={{ backgroundColor: accentColor }}
          />
          <div className="pl-4 overflow-hidden">
            <h2 className="font-serif text-lg font-bold italic text-stone-800 mb-1 leading-tight truncate">
              {article.title || "Untitled"}
            </h2>
            <p className="font-serif text-[10px] leading-relaxed text-stone-600 line-clamp-3 whitespace-pre-wrap">
              {article.content || "No content..."}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

DiaryPreview.displayName = "DiaryPreview";

// =====================
// 2) EditorDrawPanel
// =====================

export const EditorDrawPanel = ({
  scene,
  onSaveScene,
  onClose,
  accentColor = "#000000",
}: {
  scene: PersistedScene;
  onSaveScene: (next: PersistedScene) => void;
  onClose: () => void;
  accentColor?: string;
}) => {
  const [gridOn, setGridOn] = useState(true); // ←要望：最初から使えるように
  const [api, setApi] = useState<any>(null);

  const initialData = useMemo(() => {
    const base = toExcalidrawInitialData(scene);
    const withFrame = ensureFrame(base.elements);
    return { ...base, elements: withFrame.elements };
  }, [scene]);

  // 描画中の最新状態（生データ）をrefに保持。setStateしない！
  const draftRef = useRef<any>(initialData);

  // 開いた瞬間に必ず「枠へ戻す」＝ Scroll back to content 対策
  useEffect(() => {
    if (!api) return;
    fitToFrame(api, initialData.elements);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />


        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Editing Drawing
            </span>

            <button
              type="button"
              onClick={() => setGridOn((v) => !v)}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-2 rounded-full active:scale-95 transition"
            >
              <Grid3X3 size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Grid
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              // frameを消されても戻す
              const ensured = ensureFrame(draftRef.current.elements ?? []);
              draftRef.current = { ...draftRef.current, elements: ensured.elements };
              onSaveScene(sanitizeSceneForStorage(draftRef.current));
              onClose();
            }}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Done
            </span>
            <Check size={16} />
          </button>
        </div>

        <div className="flex-1 bg-[#F9F8F6] p-4">
          <div
            className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-white"
            style={{
              // モバイルで描画ジェスチャをブラウザスクロールに奪われないようにする
              touchAction: "none",
            }}
          >
            <Excalidraw
              initialData={initialData as any}
              excalidrawAPI={(apiObj: any) => setApi(apiObj)}
              theme="light"
              gridModeEnabled={gridOn}
              onChange={(elements: any, appState: any, files: any) => {
                // setStateしない！（無限更新を断つ）
                const ensured = ensureFrame(elements ?? []);
                const safeAppState = {
                  ...appState,
                  collaborators:
                    appState?.collaborators instanceof Map
                      ? appState.collaborators
                      : new Map(),
                };
                draftRef.current = { elements: ensured.elements, appState: safeAppState, files };
              }}
              UIOptions={{
                canvasActions: {
                  toggleTheme: false,
                },
              }}
            />
          </div>

          <div
            className="mt-3 h-[2px] w-full rounded-full opacity-60"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

  );
};

// =====================
// 3) EditorTextPanel
// =====================

export const EditorTextPanel = ({
  article,
  onChange,
  onClose,
}: {
  article: Article;
  onChange: (updated: Article) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full rounded-t-[32px] shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white sticky top-0 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Editing Text
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Done
            </span>
            <Check size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 bg-[#F9F8F6]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest">
              <Type size={12} /> Title
            </label>
            <input
              type="text"
              value={article.title || ""}
              onChange={(e) => onChange({ ...article, title: e.target.value })}
              className="w-full bg-transparent text-2xl font-serif font-bold text-stone-800 border-b border-stone-200 focus:border-stone-800 focus:outline-none py-2 transition-colors"
              placeholder="Title..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest">
              <PenTool size={12} /> Story
            </label>
            <textarea
              value={article.content || ""}
              onChange={(e) => onChange({ ...article, content: e.target.value })}
              className="w-full h-48 bg-white rounded-2xl p-5 text-base font-serif leading-relaxed text-stone-700 shadow-sm border-none resize-none focus:ring-2 focus:ring-stone-200 transition-all"
              placeholder="Write your story..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pb-10">
            <div className="p-5 bg-white rounded-2xl shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest">
                <Palette size={12} /> Color
              </label>
              <div className="flex items-center gap-3 relative">
                <div
                  className="w-8 h-8 rounded-full border border-stone-100 shadow-inner"
                  style={{ backgroundColor: article.color || "#000000" }}
                />
                <input
                  type="color"
                  value={article.color || "#000000"}
                  onChange={(e) => onChange({ ...article, color: e.target.value })}
                  className="flex-1 h-8 cursor-pointer opacity-0 absolute w-10"
                  aria-label="Pick color"
                />
                <span className="text-xs font-mono text-stone-500 uppercase">
                  {article.color || "#000000"}
                </span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-2 tracking-widest">
                <Star size={12} /> Rating
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={article.rating ?? 0}
                  onChange={(e) =>
                    onChange({ ...article, rating: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-800 shadow-inner"
                />
                <span className="text-right text-xs font-mono font-bold text-stone-800">
                  {article.rating ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
