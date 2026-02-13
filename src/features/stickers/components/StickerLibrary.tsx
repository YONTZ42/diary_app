"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sticker } from '@/types/schema';
import { StickerGrid } from './StickerGrid';
import { StickerTagFilter } from './StickerTagFilter';
import { Loader2 } from 'lucide-react';

// 動的インポート (SSR回避)
const PhotoCutoutPanel = dynamic(
  () => import('./PhotoCutoutPanel').then(m => m.PhotoCutoutPanel),
  { ssr: false, loading: () => null }
);
const StickerEditorPanel = dynamic(
  () => import('./StickerEditorPanel').then(m => m.StickerEditorPanel),
  { ssr: false, loading: () => null }
);

interface StickerLibraryProps {
  initialStickers?: Sticker[];
  onCreateSticker?: (blob: Blob) => Promise<any>;
}

export const StickerLibrary: React.FC<StickerLibraryProps> = ({ initialStickers = [], onCreateSticker }) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'market'>('mine');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  
  // --- Create Flow States ---
  const [isCutoutOpen, setIsCutoutOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 一時データ保持用
  const [tempBlob, setTempBlob] = useState<Blob | null>(null);
  const [tempPoints, setTempPoints] = useState<number[]>([]);

  useEffect(() => {
    setStickers(initialStickers);
  }, [initialStickers]);

  const filteredStickers = stickers.filter(s => {
    if (!selectedTag) return true;
    return (s.tags ?? []).includes(selectedTag);
  });
  const allTags = Array.from(new Set(stickers.flatMap(s => s.tags ?? [])));

  // 1. Cutout 完了ハンドラ
  const handleCutoutComplete = (blob: Blob, points?: number[]) => {
    setTempBlob(blob);
    setTempPoints(points || []);
    setIsCutoutOpen(false);
    setIsEditorOpen(true); // 次のパネルへ
  };

  // 2. Editor 完了ハンドラ (最終保存)
  const handleEditorComplete = async (finalBlob: Blob, styleConfig: any) => {
    setIsEditorOpen(false);
    setIsUploading(true);

    if (onCreateSticker) {
      try {
        // ここで styleConfig も一緒に保存するならAPI拡張が必要だが、
        // 今回はとりあえず画像(Blob)を保存する
        await onCreateSticker(finalBlob);
      } catch(e) {
        alert('Failed to upload sticker');
      } finally {
        setIsUploading(false);
      }
    } else {
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      {/* ... Tab & Filter (変更なし) ... */}
      <div className="flex border-b border-gray-100 px-4 pt-4">
        <button onClick={() => setActiveTab('mine')} className={`mr-6 pb-2 text-lg font-bold transition-colors ${activeTab === 'mine' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>My Stickers</button>
        <button onClick={() => setActiveTab('market')} className={`pb-2 text-lg font-bold transition-colors ${activeTab === 'market' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>Market</button>
      </div>

      {activeTab === 'mine' ? (
        <>
          <StickerTagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
          <StickerGrid stickers={filteredStickers} onSelectSticker={() => {}} onCreateNew={() => setIsCutoutOpen(true)} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-500"><p>Coming Soon</p></div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-bold text-lg">Creating Sticker...</p>
        </div>
      )}

      {/* Step 1: Cutout Panel */}
      <PhotoCutoutPanel
        isOpen={isCutoutOpen}
        onClose={() => setIsCutoutOpen(false)}
        onComplete={handleCutoutComplete}
      />

      {/* Step 2: Editor Panel */}
      <StickerEditorPanel
        isOpen={isEditorOpen}
        imageBlob={tempBlob}
        manualPoints={tempPoints} // ★ポイントを渡す
        onClose={() => setIsEditorOpen(false)}
        onComplete={handleEditorComplete}
      />
    </div>
  );
};