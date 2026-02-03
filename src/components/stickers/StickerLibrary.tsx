'use client';

import React, { useState } from 'react';
import { Sticker, StickerStyle } from '@/types/schema';
import { StickerGrid } from './StickerGrid';
import { StickerTagFilter } from './StickerTagFilter';
import { StickerEditor } from './StickerEditor';
import { PhotoCutoutPanel } from './PhotoCutoutPanel';
import { generateMockStickers } from '@/utils/dummyStickers'; // 追加

export const StickerLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mine' | 'market'>('mine');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 修正: generateMockStickers を初期値に使用
  const [stickers] = useState<Sticker[]>(() => {
    const data = generateMockStickers();
    console.log("Loaded stickers:", data.length); // ★ここが 6 と出るかコンソールで確認
    return data;
  });

  // Modal States
  const [isCutoutOpen, setIsCutoutOpen] = useState(false);
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  // Filter Logic
  const filteredStickers = stickers.filter(s => {
    if (!selectedTag) return true;
    return s.tags.includes(selectedTag);
  });

  // Unique Tags
  const allTags = Array.from(new Set(stickers.flatMap(s => s.tags)));

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      {/* Tab Switcher (My Stickers / Market) */}
      <div className="flex border-b border-gray-100 px-4 pt-4">
        <button
          onClick={() => setActiveTab('mine')}
          className={`mr-6 pb-2 text-lg font-bold transition-colors ${
            activeTab === 'mine' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          My Stickers
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`pb-2 text-lg font-bold transition-colors ${
            activeTab === 'market' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Market
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'mine' ? (
        <>
          <StickerTagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
          <StickerGrid
            stickers={filteredStickers}
            onSelectSticker={(s) => setEditingSticker(s)}
            onCreateNew={() => setIsCutoutOpen(true)}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-500">
          <p>ステッカーマーケット (Coming Soon)</p>
          <p className="text-sm">他のユーザーが作った素材を探せます</p>
        </div>
      )}

      {/* Modals */}
      <PhotoCutoutPanel
        isOpen={isCutoutOpen}
        onClose={() => setIsCutoutOpen(false)}
        onComplete={(blob) => {
            setIsCutoutOpen(false);
            // 本来はここで新規Stickerを作成してEditorを開く
            // デモ用にリストの最初のステッカーを使用
            setEditingSticker(stickers[0]); 
        }}
      />

      <StickerEditor
        isOpen={!!editingSticker}
        sticker={editingSticker}
        onClose={() => setEditingSticker(null)}
        onSave={(newStyle) => {
            console.log('Saved style:', newStyle);
            setEditingSticker(null);
        }}
      />
    </div>
  );
};