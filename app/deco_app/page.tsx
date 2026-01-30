"use client";

import React from 'react';
import SwipeableLayout from '../components/SwipeableLayout';

// 以前作成した各ページコンポーネントをインポート
// (注: Next.jsのApp Routerでは通常 page.tsx はルートとして扱われますが、
//  ここではコンポーネントとして再利用するために import しています)
import PagesScreen from '../deco_calendar/page'; 
import CreatePage from '../deco_create/page';
import StickersPage from '../deco_stickers/page';
import NotebooksPage from '../deco_notebooks/page';

export default function AppRoot() {
  return (
    <main>
      <SwipeableLayout
        // 各画面のコンテンツを渡す
        // FooterNavの高さ(約64px)分、下部が隠れるのを防ぐため、
        // 必要に応じて各コンポーネント内で pb-20 などを指定するか、ここで調整する
        pagesContent={<div className="h-full pb-16"><PagesScreen /></div>}
        createContent={<div className="h-full pb-16"><CreatePage /></div>}
        stickersContent={<div className="h-full pb-16"><StickersPage /></div>}
        notebooksContent={<div className="h-full pb-16"><NotebooksPage /></div>}
      />
    </main>
  );
}
