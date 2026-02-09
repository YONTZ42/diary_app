'use client';

import React, { useState, useEffect } from 'react';
import { Sticker, StickerStyle } from '@/types/schema';
import { StickerGrid } from './StickerGrid';
import { StickerTagFilter } from './StickerTagFilter';
import { StickerEditor } from './StickerEditor';
import { PhotoCutoutPanel } from './PhotoCutoutPanel';
import { generateMockStickers } from '@/utils/dummyStickers'; // 追加
import { Loader2 } from 'lucide-react'; // 追加

interface StickerLibraryProps {
  initialStickers?: Sticker[];
  onCreateSticker?: (blob: Blob) => Promise<any>;
}

export const StickerLibrary: React.FC<StickerLibraryProps> = ({ initialStickers=[], onCreateSticker }) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'market'>('mine');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 修正: generateMockStickers を初期値に使用
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  // ★追加: アップロード中のローディングフラグ
  const [isUploading, setIsUploading] = useState(false);


  // 親の更新を反映
  useEffect(() => {
    setStickers(initialStickers);
  }, [initialStickers]);

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
  
  console.log("png json", initialStickers);

  
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

      {/* ★追加: アップロード中のローディングオーバーレイ */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-bold text-lg">Creating Sticker...</p>
          <p className="text-sm text-gray-300 mt-1">Uploading to cloud</p>
        </div>
      )}


      {/* Modals */}
      <PhotoCutoutPanel
        isOpen={isCutoutOpen}
        onClose={() => setIsCutoutOpen(false)}
        onComplete={async (blob) => {
            // ★変更: ローディング開始
            setIsUploading(true);
            setIsCutoutOpen(false); // パネルは閉じてOK（ローディング画面が出るので）

            if (onCreateSticker) {
               try {
                 const newSticker = await onCreateSticker(blob);
                 // 成功したらEditorを開くなどのUXも可能
                 // setEditingSticker(newSticker); 
               } catch(e) {
                 alert('Failed to upload sticker');
               } finally {
                 // ★変更: 完了後にローディング終了
                 setIsUploading(false);
               }
            } else {
               // デモ用
               setTimeout(() => setIsUploading(false), 1000);
            }
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