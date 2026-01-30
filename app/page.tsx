"use client";

import React, { useState } from 'react';
import FooterNav, { TabId } from './components/decoFooterNav';

import PagesScreen from './deco_calendar/page'; 
import CreatePage from './deco_create/page';
import StickersPage from './deco_stickers/page';
import NotebooksPage from './deco_notebooks/page';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabId>('pages');

  const renderContent = () => {
    switch (currentTab) { 
      case 'notebooks': return <NotebooksPage />;
      case 'pages': return <PagesScreen />;
      case 'create': return <CreatePage />;
      case 'stickers': return <StickersPage/>;
      default: return <PagesScreen />;
    }
  };

  return (
    // main自体は画面いっぱいに固定し、中身がはみ出さないようにする
    <main className="flex flex-col h-[100dvh] w-full bg-slate-50 overflow-hidden">
      
      {/* 
        Main Content Area
        ★修正: overflow-hidden を削除し、単にflex-1で領域を確保するだけにする。
        また、pb-[calc(...)] は、コンテンツ領域自体のパディングとして機能させるため残すが、
        中の要素が h-full で overflow-auto を持っている場合、このpaddingがスクロール領域に含まれてしまうことがある。
        
        ベストプラクティス:
        このラッパーは単なる「配置場所」とし、高さ制限を行わない（または h-full）。
        各ページのルート要素で `h-full overflow-y-auto pb-20` のように制御してもらう。
      */}
      <div className="flex-1 w-full relative h-full"> 
        {renderContent()}
      </div>

      {/* Footer Navigation (z-indexを上げて上に被せる) */}
      <FooterNav 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
      />

    </main>
  );
}