'use client';

import React from 'react';
import { CalendarDays, PlusCircle, Smile, Library } from 'lucide-react';

export type TabId = 'pages' | 'create' | 'stickers' | 'notebooks';

interface FooterNavProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function FooterNav({ currentTab, onTabChange }: FooterNavProps) {
  
  // タブ定義
  const tabs = [
      { id: 'notebooks', label: 'Library', Icon: Library },
    { id: 'pages', label: 'Pages', Icon: CalendarDays },
    { id: 'create', label: 'Create', Icon: PlusCircle },
    { id: 'stickers', label: 'Stickers', Icon: Smile },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-100 bg-white/95 backdrop-blur-md pb-safe-area-inset-bottom">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = currentTab === id;
          const isCreate = id === 'create';

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-1 focus:outline-none"
            >
              {/* Active Indicator (Top Bar) */}
              {isActive && !isCreate && (
                <span className="absolute top-0 h-0.5 w-10 rounded-b-full bg-slate-800" />
              )}

              {/* Icon Container */}
              <div
                className={`
                  relative transition-all duration-300 ease-out
                  ${isCreate && isActive ? 'text-blue-600 scale-110 -translate-y-2' : ''}
                  ${isCreate && !isActive ? 'text-blue-400 -translate-y-1' : ''}
                  ${!isCreate && isActive ? 'text-slate-800 scale-105' : 'text-slate-400 group-hover:text-slate-600'}
                `}
              >
                {/* Createボタンだけ背景円をつける装飾 */}
                {isCreate ? (
                  <div className={`
                    rounded-full p-2 shadow-sm transition-all
                    ${isActive ? 'bg-blue-50 shadow-blue-200' : 'bg-white shadow-gray-200'}
                  `}>
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                  </div>
                ) : (
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] leading-none transition-colors duration-200
                  ${isActive ? 'font-bold text-slate-800' : 'font-medium text-slate-400'}
                  ${isCreate ? 'mt-0' : ''} 
                `}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}