"use client";

import React, { useState } from 'react';
import { AppFooter, TabId } from '@/components/layout/AppFooterSPA';

// コンポーネントインポート
import { DiaryFeature } from '@/features/diary/DiaryFeature';
import { StickersFeature } from '@/features/stickers/StickersFeature';
import { FriendsFeature } from '@/features/friends/FriendsFeature';
import { ScheduleFeature } from '@/features/schedule/ScheduleFeature';
import { CalendarFeature } from '@/features/calendar/CalendarFeature';

// ★修正: Viewコンポーネントを関数の外に出す、または直接divを使う
// ここではシンプルに直接記述するスタイルに変更

export default function AppPage() {
  const [currentTab, setCurrentTab] = useState<TabId>('diary');

  const handleSwitchTab = (tab: TabId) => {
    setCurrentTab(tab);
  };

  return (
    <>
      {/* 
         各Featureを常にレンダリングしておき、CSSで表示/非表示を切り替える。
         keyを指定しないことで、Reactは「同じdiv」として扱い、中身の再マウントを防ぐ。
      */}
      
      <div style={{ display: currentTab === 'diary' ? 'block' : 'none' }} className="w-full h-full min-h-screen">
        <DiaryFeature />
      </div>
      
      <div style={{ display: currentTab === 'stickers' ? 'block' : 'none' }} className="w-full h-full min-h-screen">
        <StickersFeature />
      </div>
      
      <div style={{ display: currentTab === 'friends' ? 'block' : 'none' }} className="w-full h-full min-h-screen">
        <FriendsFeature />
      </div>
      
      <div style={{ display: currentTab === 'schedule' ? 'block' : 'none' }} className="w-full h-full min-h-screen">
        <ScheduleFeature isActive={currentTab === 'schedule'} />
      </div>
      
      <div style={{ display: currentTab === 'calendar' ? 'block' : 'none' }} className="w-full h-full min-h-screen">
        <CalendarFeature />
      </div>

      <AppFooter
        currentTab={currentTab}
        onSwitchTab={handleSwitchTab}
      />
    </>
  );
}