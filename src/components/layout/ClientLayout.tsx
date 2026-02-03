"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppFooter } from './AppFooter';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // URLに基づいて初期モードを判定
  const getInitialMode = () => {
    if (pathname.includes('/deco_schedule') || pathname.includes('/deco_calendar')) return 'plan';
    return 'creative';
  };

  const [mode, setMode] = useState<'creative' | 'plan'>(getInitialMode);

  // パス変更時にモードを同期（ブラウザバック対策）
  useEffect(() => {
    const newMode = getInitialMode();
    if (newMode !== mode) setMode(newMode);
  }, [pathname]);

  const handleSwitchMode = () => {
    const newMode = mode === 'creative' ? 'plan' : 'creative';
    setMode(newMode);

    // モード切り替え時に、そのモードの代表ページへ遷移
    if (newMode === 'creative') router.push('/deco_diary');
    else router.push('/deco_schedule');
  };

  return (
    <div className="relative min-h-screen">
      {children}
      <AppFooter currentMode={mode} onSwitchMode={handleSwitchMode} />
    </div>
  );
};