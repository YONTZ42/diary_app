'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import FooterNav, { TabId } from './decoFooterNav';

// タブの並び順（スワイプ方向判定用）
const TAB_ORDER: TabId[] = ['pages', 'create', 'stickers', 'notebooks'];

interface SwipeableLayoutProps {
  pagesContent: ReactNode;
  createContent: ReactNode;
  stickersContent: ReactNode;
  notebooksContent: ReactNode;
}

export default function SwipeableLayout({
  pagesContent,
  createContent,
  stickersContent,
  notebooksContent,
}: SwipeableLayoutProps) {
  const [currentTab, setCurrentTab] = useState<TabId>('pages');
  const [direction, setDirection] = useState(0); // 1: Right, -1: Left

  // タブ切り替え処理
  const handleTabChange = (newTab: TabId) => {
    if (currentTab === newTab) return;
    const currentIndex = TAB_ORDER.indexOf(currentTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentTab(newTab);
  };

  // スワイプ完了時の処理
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Createタブ（お絵描き中）はスワイプ遷移させない
    if (currentTab === 'create') return;

    const SWIPE_THRESHOLD = 50;
    const { offset, velocity } = info;
    const currentIndex = TAB_ORDER.indexOf(currentTab);

    // 右へスワイプ (前のタブへ戻る)
    if (offset.x > SWIPE_THRESHOLD && velocity.x > 0) {
      if (currentIndex > 0) {
        handleTabChange(TAB_ORDER[currentIndex - 1]);
      }
    } 
    // 左へスワイプ (次のタブへ進む)
    else if (offset.x < -SWIPE_THRESHOLD && velocity.x < 0) {
      if (currentIndex < TAB_ORDER.length - 1) {
        handleTabChange(TAB_ORDER[currentIndex + 1]);
      }
    }
  };

  // 表示コンテンツの決定
  const renderContent = () => {
    switch (currentTab) {
      case 'pages': return pagesContent;
      case 'create': return createContent;
      case 'stickers': return stickersContent;
      case 'notebooks': return notebooksContent;
      default: return null;
    }
  };

  // アニメーションVariants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0.8,
      zIndex: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-20%' : '20%', // 少し残るパララックス効果
      opacity: 0,
      zIndex: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      
      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden bg-white">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            
            // スワイプ設定
            drag={currentTab === 'create' ? false : "x"} // Create画面ではドラッグ無効
            dragConstraints={{ left: 0, right: 0 }} // 引っ張って戻る動きのみ
            dragElastic={0.1} // ゴムのような抵抗感
            onDragEnd={handleDragEnd}
            
            className="absolute inset-0 h-full w-full bg-white"
          >
            {/* 
              コンテンツコンテナ
              FooterNavの高さ分だけ下部を空ける処理は、
              親(app/page.tsx)側で pb-16 を入れている想定 
            */}
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      <FooterNav currentTab={currentTab} onTabChange={handleTabChange} />
      
    </div>
  );
}