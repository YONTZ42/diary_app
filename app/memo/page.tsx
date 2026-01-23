"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool } from "lucide-react";
import dynamic from "next/dynamic";

// --- tldraw の SSR 回避設定 ---
const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
});
import "tldraw/tldraw.css";

// --- 型定義とデータ (既存のものは省略せずに維持してください) ---
// ... (既存の ISSUES データなどはそのまま残してください) ...

export default function Page() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null); // 本来は型を指定
  const [isEditing, setIsEditing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false); // tldraw用の状態

  return (
    <div className="relative min-h-screen bg-stone-50">
      {/* 既存のメインコンテンツ（雑誌風のUIなど） */}
      <main>
          {/* ここに元の ISSUES.map などのコードが入ります */}
          <button 
            onClick={() => setShowCanvas(true)}
            className="fixed bottom-24 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg"
          >
            Miro風メモを開く
          </button>
      </main>

      {/* --- tldraw キャンバスレイヤー --- */}
      <AnimatePresence>
        {showCanvas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            // 既存のUIより手前に来るよう z-50 を指定し、全画面固定にする
            className="fixed inset-0 z-[100] bg-white"
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setShowCanvas(false)}
              className="absolute top-4 right-4 z-[110] bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={24} />
            </button>

            {/* tldraw 本体 */}
            <div className="w-full h-full">
              <Tldraw />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 既存の EditorPanel (もし併用する場合) */}
      <AnimatePresence>
        {isEditing && selectedArticle && (
          <div className="z-[60] relative">
             {/* EditorPanel のコード */}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}