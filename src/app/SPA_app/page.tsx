"use client";

import React, { useState } from 'react';
import { AppFooter, TabId } from '@/components/layout/AppFooterSPA';

// コンポーネントインポート
import { DiaryFeature } from '@/features/diary/DiaryFeature';
import { StickersFeature } from '@/features/stickers/StickersFeature';
import { FriendsFeature } from '@/features/friends/FriendsFeature';
import { ScheduleFeature } from '@/features/schedule/ScheduleFeature';
import { CalendarFeature } from '@/features/calendar/CalendarFeature';

export default function AppPage() {
  const [currentTab, setCurrentTab] = useState<TabId>('diary');
  // ★削除: currentMode はもう管理しない

  const handleSwitchTab = (tab: TabId) => {
    setCurrentTab(tab);
  };

  const View = ({ id, children }: { id: TabId; children: React.ReactNode }) => (
    <div 
      style={{ display: currentTab === id ? 'block' : 'none' }} 
      className="w-full h-full min-h-screen"
    >
      {children}
    </div>
  );

  return (
    <>
      <View id="diary"><DiaryFeature /></View>
      <View id="stickers"><StickersFeature /></View>
      <View id="friends"><FriendsFeature /></View>
      <View id="schedule"><ScheduleFeature /></View>
      <View id="calendar"><CalendarFeature /></View>

      <AppFooter
        currentTab={currentTab}
        onSwitchTab={handleSwitchTab}
        // ★削除: currentMode, onSwitchMode は渡さない
      />
    </>
  );
}