"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, Sticker, Users, 
  CalendarDays, CalendarRange, 
  ArrowLeftRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

type NavMode = 'creative' | 'plan';

interface AppFooterProps {
  currentMode: NavMode;
  onSwitchMode: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ currentMode, onSwitchMode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const creativeTabs = [
    { id: 'diary', path: '/deco_diary', icon: BookOpen, label: 'Diary' },
    { id: 'stickers', path: '/deco_stickers', icon: Sticker, label: 'Stickers' },
    { id: 'friends', path: '/deco_friends', icon: Users, label: 'Friends' },
  ];

  const planTabs = [
    { id: 'schedule', path: '/deco_schedule', icon: CalendarDays, label: 'Schedule' },
    { id: 'calendar', path: '/deco_calendar', icon: CalendarRange, label: 'Calendar' },
  ];

  const currentTabs = currentMode === 'creative' ? creativeTabs : planTabs;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3">
        
        {/* Main Navigation Bar */}
        <motion.div 
          layout // コンテナサイズが変わるときのアニメーション
          className="bg-slate-900/90 backdrop-blur-md text-white rounded-full px-2 py-2 shadow-2xl flex items-center gap-1 border border-white/10 overflow-hidden"
        >
          {/* AnimatePresence を削除し、直接マップする */}
          {currentTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`relative px-5 py-3 rounded-full flex flex-col items-center justify-center transition-colors duration-300 z-10 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator" // これだけで背景が移動するアニメーションになる
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
          onClick={onSwitchMode}
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