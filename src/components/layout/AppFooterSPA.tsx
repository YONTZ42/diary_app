"use client";

import React, { useState } from 'react';
import { 
  BookOpen, Sticker, Users, 
  CalendarDays, CalendarRange, 
  ArrowLeftRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'diary' | 'stickers' | 'friends' | 'schedule' | 'calendar';
type NavMode = 'creative' | 'plan';

interface AppFooterProps {
  currentTab: TabId;
  onSwitchTab: (tab: TabId) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ 
  currentTab, 
  onSwitchTab, 
}) => {
  // ★変更点: モードの状態管理をここ（フッター内部）に移動
  const [currentMode, setCurrentMode] = useState<NavMode>('creative');

  const handleSwitchMode = () => {
    setCurrentMode(prev => prev === 'creative' ? 'plan' : 'creative');
  };

  const creativeTabs: { id: TabId; icon: any; label: string }[] = [
    { id: 'diary', icon: BookOpen, label: 'Diary' },
    { id: 'stickers', icon: Sticker, label: 'Stickers' },
  ];

  const planTabs: { id: TabId; icon: any; label: string }[] = [
    { id: 'schedule', icon: CalendarDays, label: 'Schedule' },
    { id: 'calendar', icon: CalendarRange, label: 'Calendar' },
  ];

  const currentTabs = currentMode === 'creative' ? creativeTabs : planTabs;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3">
        
        {/* Navigation Tabs */}
        <motion.div 
          layout
          className="bg-slate-900/90 backdrop-blur-md text-white rounded-full px-2 py-2 shadow-2xl flex items-center gap-1 border border-white/10 overflow-hidden"
        >
          {currentTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSwitchTab(tab.id)}
                className={`relative px-5 py-3 rounded-full flex flex-col items-center justify-center transition-colors duration-300 z-10 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/20 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </motion.div>

        {/* Mode Switcher Button */}
        <button
          onClick={handleSwitchMode}
          className={`h-[58px] w-[58px] rounded-full flex items-center justify-center shadow-xl border-2 transition-all active:scale-95 ${
            currentMode === 'creative' 
              ? 'bg-white text-slate-900 border-slate-100' 
              : 'bg-blue-600 text-white border-blue-500'
          }`}
        >
          <ArrowLeftRight size={20} strokeWidth={2.5} />
        </button>

      </div>
    </div>
  );
};