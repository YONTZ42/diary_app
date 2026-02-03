import React from 'react';
import { Sticker } from '@/types/schema';
import { StickerCard } from './StickerCard';
import { PlusIcon } from '@heroicons/react/24/outline';

interface StickerGridProps {
  stickers: Sticker[];
  onSelectSticker: (sticker: Sticker) => void;
  onCreateNew: () => void;
}

export const StickerGrid: React.FC<StickerGridProps> = ({
  stickers,
  onSelectSticker,
  onCreateNew,
}) => {
  return (
    // pb-24 を追加して、下部ナビゲーションなどで隠れないようにします
    <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-4 md:grid-cols-5 pb-24">
      
      {/* 新規作成ボタン */}
      <button
        onClick={onCreateNew}
        className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500"
      >
        <PlusIcon className="h-8 w-8" />
        <span className="mt-1 text-xs font-bold">New</span>
      </button>

      {/* ステッカー一覧：データがない場合のガードを追加 */}
      {stickers && stickers.length > 0 ? (
        stickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            onClick={onSelectSticker}
          />
        ))
      ) : (
        <div className="col-span-2 text-gray-400 text-sm p-4">
          データがありません
        </div>
      )}
    </div>
  );
};