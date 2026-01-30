"use client";

import React, { useState } from 'react';
import { PageCanvasEditor } from '../components/PageCanvasEditor';
import { Page } from '../types/schema';
import { usePersistentPages } from '../hooks/usePersistentPages';

// ★重要: ランダム値を混ぜて絶対に被らないIDを作る
const generateUniqueId = () => {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const createNewDraft = (): Page => ({
  id: generateUniqueId(), 
  schemaVersion: 1,
  type: 'diary',
  date: new Date().toISOString().split('T')[0],
  title: '',
  note: '',
  userId: 'current-user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assets: {},
  usedStickerIds: [],
  preview: { kind: 'local', key: '', mime: 'image/png' },
  sceneData: {
    elements: [],
    appState: { viewBackgroundColor: "#ffffff00" },
  }
});

export default function CreatePage() {
  const { pages, updatePages } = usePersistentPages();
  
  // ★重要: 初期化関数を渡す書き方にする (() => ...)
  // これによりレンダリングごとの無駄なID生成を防ぐ
  const [draftPage, setDraftPage] = useState<Page>(() => createNewDraft());

  const handleSave = (updated: Partial<Page>) => {
    // 既存IDとの重複チェック（念のための安全策）
    let finalId = draftPage.id;
    if (pages.some(p => p.id === finalId)) {
      finalId = generateUniqueId();
    }

    const newPage: Page = {
      ...draftPage,
      ...updated,
      id: finalId,
      updatedAt: new Date().toISOString(),
    };

    updatePages([newPage, ...pages]);
    setDraftPage(createNewDraft()); // 次のためにリセット
    alert("✨ 保存しました");
  };

  const handleClose = () => {
    if (confirm("編集を破棄しますか？")) {
       setDraftPage(createNewDraft());
    }
  };

  return (
    <div className="h-full bg-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[85vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border-4 border-white ring-1 ring-black/5">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 z-50 opacity-80" />
        
        <div className="flex-1 h-full bg-white">
          {/* keyにIDを指定して、IDが変わったらコンポーネントを作り直させる */}
          <PageCanvasEditor 
            key={draftPage.id} 
            initialPage={draftPage}
            focusTarget="canvas"
            onSave={handleSave}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}