import React from 'react';
import { Page } from '@/types/schema';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  pages: Page[]; // 今月のページデータ配列
  onDayClick: (day: number, page?: Page) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ year, month, pages, onDayClick }) => {
  // 月初めの曜日 (0:Sun - 6:Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // 月の日数
  const daysInMonth = new Date(year, month, 0).getDate();

  // 空白セル配列
  const emptyCells = Array.from({ length: firstDayOfWeek });
  // 日付セル配列
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 指定日のページデータを検索するヘルパー
const getPageForDay = (day: number) => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // 複数ある場合は最初の1件を返す
  return pages.find(p => p.date === dateStr);
};


  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((d, i) => (
          <div 
            key={d} 
            className={`py-2 text-center text-[10px] font-bold tracking-widest ${i === 0 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 bg-gray-200 gap-[1px] border-b border-gray-200">
        {/* 前月の空白 */}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="bg-white/50 w-full aspect-square" />
        ))}

        {/* 今月の日付 */}
        {dayCells.map((day) => {
          const page = getPageForDay(day);
          return (
            <CalendarDayCell
              key={day}
              day={day}
              page={page}
              onClick={() => onDayClick(day, page)}
            />
          );
        })}
        
        {/* 最終行の余白埋め (レイアウトを綺麗にするため) */}
        {Array.from({ length: (7 - (emptyCells.length + dayCells.length) % 7) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-white/50 w-full aspect-square" />
        ))}
      </div>
    </div>
  );
};