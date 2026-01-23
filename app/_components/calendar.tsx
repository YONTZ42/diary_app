"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

// --- Types ---
type Article = {
  id: string;
  date: number;
  imageUrl: string;
  issueId?: string;
};

/**
 * Calendar Component
 * (Scroll-friendly, strict long-press gesture)
 */
export const Calendar = ({
  articles,
  selectedDraftIds,
  focusedArticleId,
  onFocusArticle,
  onUpdateDraftSelection,
}: {
  articles: Article[];
  activeIssueId: string | null;
  selectedDraftIds: Set<string>;
  focusedArticleId: string | null;
  onFocusArticle: (id: string | null) => void;
  onUpdateDraftSelection: (ids: Set<string>) => void;
}) => {
  // --- Refs for Gesture Logic ---
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const isLongPressSession = useRef(false); // 今回のタッチ操作が長押しモードか
  const isScrollOrTap = useRef(false);      // スクロールまたはタップ判定（長押し失敗）

  // --- Helpers ---
  
  // 選択セットの更新ヘルパー
  const toggleSelection = (id: string, forceAdd = false) => {
    const newSet = new Set(selectedDraftIds);
    if (forceAdd) {
        newSet.add(id);
    } else {
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
    }
    onUpdateDraftSelection(newSet);
  };

  // --- Handlers ---

  const handlePointerDown = (article: Article, e: React.PointerEvent<HTMLDivElement>) => {
    // マウスの右クリックなどは無視
    if (e.button !== 0) return;

    const pointerId = e.pointerId;
    const target = e.currentTarget; // イベントハンドラが設定されている要素

    // 状態リセット
    isLongPressSession.current = false;
    isScrollOrTap.current = false;
    pointerStartPos.current = { x: e.clientX, y: e.clientY };

    // 長押しタイマー開始 (500ms)
    longPressTimer.current = setTimeout(() => {
      // --- 長押し成立時の処理 ---
      isLongPressSession.current = true;
      
      // 重要: ポインターをキャプチャしてスクロールを阻止し、なぞり操作を有効化
      try {
          target.setPointerCapture(pointerId);
      } catch (err) {
          console.warn("Pointer capture failed", err);
      }

      // 触覚フィードバック
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

      // 開始地点のアイテムを選択状態にする（強制追加）
      toggleSelection(article.id, true);

    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. 長押し成立後の「なぞり選択」ロジック
    if (isLongPressSession.current) {
        // キャプチャ中は target が固定されるため、座標から実際の要素を取得する
        const hitTarget = document.elementFromPoint(e.clientX, e.clientY);
        const dateId = hitTarget?.getAttribute("data-date-id");

        if (dateId && !selectedDraftIds.has(dateId)) {
            toggleSelection(dateId, true); // なぞった先を追加
            if (navigator.vibrate) navigator.vibrate(10); // 軽いフィードバック
        }
        return;
    }

    // 2. 長押し成立前の「移動（スクロール）」検知ロジック
    if (pointerStartPos.current) {
        const dx = Math.abs(e.clientX - pointerStartPos.current.x);
        const dy = Math.abs(e.clientY - pointerStartPos.current.y);
        
        // 閾値を超えたら「スクロール意図」とみなしてタイマー解除
        if (dx > 8 || dy > 8) {
            isScrollOrTap.current = true; // これはスクロール操作である
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    }
  };

  const handlePointerUp = (article: Article, e: React.PointerEvent) => {
    // タイマーのクリーンアップ
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // キャプチャ解放（念のため）
    if (isLongPressSession.current) {
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
    }

    // --- クリック判定 ---
    // 「長押しモードに入っておらず」かつ「スクロール（大きく移動）もしていない」場合
    if (!isLongPressSession.current && !isScrollOrTap.current) {
        handleTap(article);
    }

    // 座標リセット
    pointerStartPos.current = null;
    isLongPressSession.current = false;
    isScrollOrTap.current = false;
  };

  const handleTap = (article: Article) => {
      // 複数選択モード中かどうか
      const isSelectionMode = selectedDraftIds.size > 0;

      if (isSelectionMode) {
          // 複数選択モード中のタップ: トグル (追加/削除)
          toggleSelection(article.id);
      } else {
          // 通常モード中のタップ: フォーカス切替
          if (focusedArticleId === article.id) {
              onFocusArticle(null);
          } else {
              onFocusArticle(article.id);
          }
      }
  };

  const offsetDays = 3;

  return (
    <div className="relative w-full px-6 pb-8 select-none">
      <div className="grid grid-cols-7 mb-2 text-center">
        {['S','M','T','W','T','F','S'].map((d,i) => (
            <span key={i} className="text-[10px] text-white/30 font-serif">{d}</span>
        ))}
      </div>

      {/* 
         touch-action: pan-y を指定することで、
         ブラウザの標準的な縦スクロールを許可します。
         長押し成立時に setPointerCapture することでスクロールを無効化し、なぞり選択に切り替えます。
      */}
      <div className="relative" style={{ touchAction: 'pan-y' }}>
        
        {/* Layer 0: Gooey Effect Background */}
        <div className="absolute inset-0 z-0 grid grid-cols-7 gap-1 pointer-events-none" style={{ filter: "url('#gooey-filter')" }}>
          {Array.from({ length: offsetDays }).map((_, i) => <div key={`bg-off-${i}`} />)}
          {articles.map((art) => (
            <div key={`bg-${art.id}`} className="aspect-square flex justify-center items-center">
               <motion.div 
                 initial={false}
                 animate={{ scale: selectedDraftIds.has(art.id) ? 1.2 : 0 }}
                 className="w-full h-full bg-amber-400 rounded-full"
               />
            </div>
          ))}
        </div>

        {/* Layer 1: Image Grid */}
        <div className="relative z-10 grid grid-cols-7 gap-1">
          {Array.from({ length: offsetDays }).map((_, i) => <div key={`off-${i}`} />)}
          
          {articles.map((art) => {
             const isMultiSelected = selectedDraftIds.has(art.id);
             const isFocused = focusedArticleId === art.id;

             return (
               <motion.div
                 key={art.id}
                 layout
                 data-date-id={art.id}
                 // Pointer Events
                 onPointerDown={(e) => handlePointerDown(art, e)}
                 onPointerMove={handlePointerMove}
                 onPointerUp={(e) => handlePointerUp(art, e)}
                 // PointerCancel時もUpと同様にリセット扱いにすると安全
                 onPointerCancel={(e) => handlePointerUp(art, e)}
                 
                 animate={{
                    scale: isMultiSelected || isFocused ? 1.3 : 1,
                    zIndex: isFocused || isMultiSelected ? 20 : 10,
                    opacity: 1,
                    filter: "grayscale(0%)"
                 }}
                 transition={{ type: "spring", stiffness: 400, damping: 25 }}
                 className={clsx(
                   "aspect-square relative rounded-md overflow-hidden bg-slate-800 transition-shadow duration-300 touch-none",
                   // 個々の要素でも touch-action を指定して誤動作防止（親のpan-yを継承するが、念のため）
                   // 長押し以外でのブラウザの拡大鏡などを防ぐ意味合い
                   isMultiSelected ? "ring-2 ring-amber-400 shadow-lg shadow-amber-900/50" : 
                   isFocused ? "ring-2 ring-white shadow-xl shadow-black/50" : "ring-0"
                 )}
                 style={{ touchAction: 'pan-y' }}
               >
                 <img
                   src={art.imageUrl}
                   alt=""
                   className="w-full h-full object-cover pointer-events-none select-none"
                 />
                 
                 <div className={clsx(
                     "absolute top-0.5 left-0.5 text-[9px] px-1 rounded transition-colors font-bold pointer-events-none",
                     isMultiSelected ? "text-slate-900 bg-amber-400/80" : 
                     isFocused ? "text-slate-900 bg-white" : "text-white bg-black/40"
                 )}>
                   {art.date}
                 </div>

                 {art.issueId && !isMultiSelected && (
                     <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm pointer-events-none" />
                 )}
               </motion.div>
             );
          })}
        </div>
      </div>
    </div>
  );
};