import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Columns, Loader2 } from 'lucide-react';

export type ViewMode = 'month' | 'week';

interface ScheduleNavigatorProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (mode: ViewMode) => void;
  onToday: () => void;
  isLoading?: boolean; // 追加
}

export const ScheduleNavigator: React.FC<ScheduleNavigatorProps> = ({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onViewChange,
  onToday,
  isLoading = false
}) => {
  const displayDate = viewMode === 'month'
    ? currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-20 sticky top-0">
      
      {/* View Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-2 sm:mb-0">
        <button
          onClick={() => !isLoading && onViewChange('month')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={14} /> Month
        </button>
        <button
          onClick={() => !isLoading && onViewChange('week')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Columns size={14} /> Week
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onPrev} 
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center min-w-[160px] relative">
          <h2 
            className={`font-serif font-bold text-lg text-gray-800 leading-none transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}
          >
            {displayDate}
          </h2>
          {/* ローディングスピナー */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>

        <button 
          onClick={onNext} 
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Action */}
      <div className="flex gap-2">
         <button 
           onClick={onToday}
           disabled={isLoading}
           className="text-xs font-bold text-blue-600 px-3 py-1 hover:bg-blue-50 rounded-full disabled:opacity-50"
         >
           TODAY
         </button>
      </div>
    </div>
  );
};