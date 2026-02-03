"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { LayoutGrid, RectangleHorizontal } from "lucide-react";

import {
  DiaryPreview,
  EditorDrawPanel,
  EditorTextPanel,
  type Article,
  type PersistedScene,
} from "./diary_and_editor";

type ScenesById = Record<string, PersistedScene>;

type ViewMode = "grid" | "slide";

const LS_ARTICLES_KEY = "demo_diary_articles_v2";
const LS_SCENES_KEY = "demo_diary_scenes_v2";

// --------------------
// Dummy Data
// --------------------
function makeDummyArticles(): Article[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  return [
    {
      id: "a_001",
      date: now - day * 0,
      imageUrl: "",
      title: "Today",
      content: "small note…\n夕方の光がよかった。",
      color: "#111827",
      rating: 72,
    },
    {
      id: "a_002",
      date: now - day * 1,
      imageUrl: "",
      title: "Walk",
      content: "歩いてると頭が整理される。\n余白が増える感じ。",
      color: "#7c3aed",
      rating: 40,
    },
    {
      id: "a_003",
      date: now - day * 2,
      imageUrl: "",
      title: "Work",
      content: "詰めすぎた。\n次回はタスクを半分にする。",
      color: "#16a34a",
      rating: 55,
    },
    {
      id: "a_004",
      date: now - day * 3,
      imageUrl: "",
      title: "Night",
      content: "夜の散歩。\n静かなテンポが戻る。",
      color: "#ef4444",
      rating: 63,
    },
    {
      id: "a_005",
      date: now - day * 4,
      imageUrl: "",
      title: "Coffee",
      content: "カフェで少しだけ書く。\n手触りのある時間。",
      color: "#0ea5e9",
      rating: 80,
    },
    {
      id: "a_006",
      date: now - day * 5,
      imageUrl: "",
      title: "Idea",
      content: "雑誌の見開き構成を整理。\n視線誘導の筋が見えた。",
      color: "#f59e0b",
      rating: 68,
    },
  ];
}

// --------------------
// localStorage utils
// --------------------
function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// --------------------
// Page
// --------------------
export default function DiaryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [scenesById, setScenesById] = useState<ScenesById>({});

  const [openDrawId, setOpenDrawId] = useState<string | null>(null);
  const [openTextId, setOpenTextId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // 初期ロード
  useEffect(() => {
    const storedArticles = safeParseJSON<Article[]>(
      localStorage.getItem(LS_ARTICLES_KEY)
    );
    const storedScenes = safeParseJSON<ScenesById>(
      localStorage.getItem(LS_SCENES_KEY)
    );

    if (storedArticles && storedArticles.length > 0) {
      setArticles(storedArticles);
    } else {
      const dummy = makeDummyArticles();
      setArticles(dummy);
      localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(dummy));
    }

    if (storedScenes) setScenesById(storedScenes);
  }, []);

  // 永続化
  useEffect(() => {
    if (articles.length === 0) return;
    localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(LS_SCENES_KEY, JSON.stringify(scenesById));
  }, [scenesById]);

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => b.date - a.date);
  }, [articles]);

  const activeTextArticle = useMemo(() => {
    return openTextId ? articles.find((a) => a.id === openTextId) : undefined;
  }, [openTextId, articles]);

  const activeDrawArticle = useMemo(() => {
    return openDrawId ? articles.find((a) => a.id === openDrawId) : undefined;
  }, [openDrawId, articles]);

  const resetLocal = () => {
    localStorage.removeItem(LS_ARTICLES_KEY);
    localStorage.removeItem(LS_SCENES_KEY);
    const dummy = makeDummyArticles();
    setArticles(dummy);
    setScenesById({});
    localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(dummy));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur border-b border-stone-100 shrink-0">
        <div className="px-6 py-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase">
              Diary
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Cards
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-stone-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "p-2 rounded-full transition-all",
                  viewMode === "grid"
                    ? "bg-stone-900 text-white shadow"
                    : "text-stone-400 hover:text-stone-600"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("slide")}
                className={clsx(
                  "p-2 rounded-full transition-all",
                  viewMode === "slide"
                    ? "bg-stone-900 text-white shadow"
                    : "text-stone-400 hover:text-stone-600"
                )}
                aria-label="Slide view"
              >
                <RectangleHorizontal size={16} />
              </button>
            </div>

            <div className="w-[1px] h-6 bg-stone-200 mx-1" />

            <button
              onClick={resetLocal}
              className="px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-bold tracking-widest uppercase text-stone-700 hover:bg-stone-100 active:scale-95 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {viewMode === "grid" ? (
          // === GRID VIEW ===
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {sortedArticles.map((a) => (
                <DiaryPreview
                  key={a.id}
                  article={a}
                  scene={scenesById[a.id] ?? null}
                  onDrawClick={() => setOpenDrawId(a.id)}
                  onTextClick={() => setOpenTextId(a.id)}
                  styleClass="aspect-[3/4]"
                />
              ))}
            </div>
          </div>
        ) : (
          // === SLIDE VIEW (Horizontal Scroll Snap) ===
          <div className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory px-6 py-8 gap-6 no-scrollbar">
            {sortedArticles.map((a) => (
              <div
                key={a.id}
                className="snap-center shrink-0 w-[85vw] sm:w-[400px] h-full max-h-[700px] flex flex-col justify-center"
              >
                <DiaryPreview
                  article={a}
                  scene={scenesById[a.id] ?? null}
                  onDrawClick={() => setOpenDrawId(a.id)}
                  onTextClick={() => setOpenTextId(a.id)}
                  styleClass="h-full w-full"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Draw Editor */}
      {openDrawId && (
        <EditorDrawPanel
          key={openDrawId}
          scene={scenesById[openDrawId] ?? null}
          accentColor={activeDrawArticle?.color ?? "#000000"}
          onSaveScene={(next) =>
            setScenesById((prev) => ({ ...prev, [openDrawId]: next }))
          }
          onClose={() => setOpenDrawId(null)}
        />
      )}

      {/* Text Editor */}
      {openTextId && activeTextArticle && (
        <EditorTextPanel
          article={activeTextArticle}
          onChange={(updated) =>
            setArticles((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x))
            )
          }
          onClose={() => setOpenTextId(null)}
        />
      )}
    </div>
  );
}
