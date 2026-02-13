import React from 'react';
import Image from 'next/image';
import { Page } from '@/types/schema';
import { FileText, Plus } from 'lucide-react';

interface CalendarDayCellProps {
  day: number;
  page?: Page; // その日の日記データ（あれば）
  onClick: () => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, page, onClick }) => {
  // 画像URLの解決
  const imageUrl = page?.preview?.key && page.preview.key.startsWith('http') 
    ? page.preview.key 
    : null;

  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square border border-gray-100 bg-white hover:z-10 hover:shadow-lg transition-all group overflow-hidden"
    >
      {/* 日付表示 (左上) */}
      <span className={`absolute top-1 left-2 z-20 text-sm font-bold font-mono ${imageUrl ? 'text-white drop-shadow-md' : 'text-gray-700'}`}>
        {day}
      </span>

      {page ? (
        <>
          {/* コンテンツがある場合 */}
          {imageUrl ? (
            // 画像（写真 or ステッカー）がある場合
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={page.title || "Diary Image"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 15vw, 10vw"
              />
              {/* 写真っぽさを出すための内側シャドウ */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
            </div>
          ) : (
            // 画像はないが日記はある場合 (テキストのみなど)
            <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-50/50 p-2">
              <FileText size={20} className="text-yellow-600 mb-1" />
              <span className="text-[8px] text-gray-500 line-clamp-2 leading-tight text-center">
                {page.title || page.note || "No Title"}
              </span>
            </div>
          )}

          {/* ホバー時のオーバーレイ */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </>
      ) : (
        /* コンテンツがない場合 (空セル) */
        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-50 text-blue-500 p-2 rounded-full">
            <Plus size={16} />
          </div>
        </div>
      )}
    </button>
  );
};