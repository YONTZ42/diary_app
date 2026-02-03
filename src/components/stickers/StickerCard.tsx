import React from 'react';
import Image from 'next/image';
import { Sticker } from '@/types/schema';

const getAssetUrl = (asset: any) => {
  if (!asset || !asset.key) return '/placeholder.png';
  return asset.key.startsWith('http') ? asset.key : `/mock/${asset.key}`;
};

interface StickerCardProps {
  sticker: Sticker;
  onClick: (sticker: Sticker) => void;
}

export const StickerCard: React.FC<StickerCardProps> = ({ sticker, onClick }) => {
  const targetAsset = sticker.thumb || sticker.png;

  return (
    <button
      onClick={() => onClick(sticker)}
      // 'relative' と 'block' を明示し、aspect-square で正方形を確保
      className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
    >
      {/* 
        Image fill を使うための親コンテナ。
        ここにも relative をつけ、w-full h-full で領域を確保します。
        p-2 (padding) は親のbuttonではなく、この中の配置で調整するか、
        あるいは画像自体に padding を持たせるイメージで object-contain を使います。
      */}
      <div className="relative h-full w-full p-2"> 
        <Image
          src={getAssetUrl(targetAsset)}
          alt={sticker.name || 'sticker'}
          fill
          sizes="(max-width: 768px) 33vw, 20vw"
          className="object-contain" // アスペクト比を維持して枠内に収める
        />
      </div>

      {sticker.favorite && (
        <div className="absolute right-1 top-1 z-10 text-red-400">
          ❤️
        </div>
      )}

      {/* ホバー時のオーバーレイ */}
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
    </button>
  );
};