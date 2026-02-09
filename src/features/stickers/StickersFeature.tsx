"use client";

import React, { useState, useEffect } from 'react';
import { StickerLibrary } from '@/components/stickers/StickerLibrary';
import { Sticker } from '@/types/schema';
import { fetchStickers } from '@/services/api'; // API関数はこれだけインポート
import { useStickerUpload } from '@/features/stickers/hooks/useStickerUpload'; // フック
import { Loader2 } from 'lucide-react';

export const StickersFeature = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  
  // フックの使用
  const { uploadAndCreateSticker, isUploading } = useStickerUpload();

  // データ取得
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStickers();
        setStickers(data);     
      } catch (e) {
        console.error(e);
        setStickers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 新規ステッカー作成フロー
  const handleCreateSticker = async (blob: Blob) => {
    try {
      const newSticker = await uploadAndCreateSticker(blob);
      setStickers(prev => [newSticker, ...prev]);
      return newSticker;
    } catch (e) {
      console.error("Failed to create sticker:", e);
      throw e;
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 
         StickerLibrary に isUploading 状態も渡すと、
         親側でスピナーを出せる（StickerLibrary内部で出す実装になっているなら不要）
      */}
      <StickerLibrary 
        initialStickers={stickers} 
        onCreateSticker={handleCreateSticker}
        // isUploading={isUploading} // 必要なら渡す
      />
    </div>
  );
};