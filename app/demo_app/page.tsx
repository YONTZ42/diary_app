// app/demo/page.tsx
"use client";

import React, { useState } from 'react';
import { Page } from '../types/schema';
import { PageCanvasPreview } from '../components/PageCanvasPreview';
import { PageCanvasEditor } from '../components/PageCanvasEditor';

// --- モックデータ生成ヘルパー ---
const generateMockPages = (): Page[] => {
  return [
    {
      id: 'page-1',
      schemaVersion: 1,
      type: 'diary',
      date: '2024-02-01',
      title: 'カフェ巡り記録',
      note: '駅前の新しいカフェに行ってみた。ラテアートが可愛い。',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: {},
      usedStickerIds: ['sticker-1'], // バッジ表示用ダミー
      preview: { kind: 'local', key: '', mime: 'image/png' },
      sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
    },
    {
      id: 'page-2',
      schemaVersion: 1,
      type: 'diary',
      date: '2024-02-02',
      title: '仕事のメモ',
      note: '・A案件の進捗確認\n・B案件のデザイン修正\n明日は10時からミーティング。',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: {},
      usedStickerIds: [],
      preview: { kind: 'local', key: '', mime: 'image/png' },
      sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
    },
    {
      id: 'page-3',
      schemaVersion: 1,
      type: 'diary',
      date: '2024-02-03',
      title: '週末の買い物リスト',
      note: '',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: {},
      usedStickerIds: ['sticker-2', 'sticker-3'],
      preview: { kind: 'local', key: '', mime: 'image/png' },
      sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
    },
  ];
};

export default function MultiPageDemo() {
  // 1. ページ配列の状態管理
  const [pages, setPages] = useState<Page[]>(generateMockPages());

  // 2. 編集中の状態管理 (ID と ターゲット)
  const [editingState, setEditingState] = useState<{
    pageId: string;
    target: 'meta' | 'canvas';
  } | null>(null);

  // 編集対象のページオブジェクトを取得
  const targetPage = editingState 
    ? pages.find(p => p.id === editingState.pageId) 
    : null;

  // --- 保存処理 ---
  const handleSave = (updatedFields: Partial<Page>) => {
    if (!editingState) return;

    setPages((prevPages) => 
      prevPages.map((page) => {
        // IDが一致するページだけを更新する
        if (page.id === editingState.pageId) {
          return {
            ...page,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        }
        return page;
      })
    );

    setEditingState(null);
  };

  // --- 新規ページ追加 (おまけ) ---
  const handleAddPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      schemaVersion: 1,
      type: 'diary',
      date: new Date().toISOString().split('T')[0],
      title: '',
      note: '',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: {},
      usedStickerIds: [],
      preview: { kind: 'local', key: '', mime: 'image/png' },
      sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
    };
    // 配列の先頭に追加して、即編集モードにする
    setPages([newPage, ...pages]);
    setEditingState({ pageId: newPage.id, target: 'meta' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      
      {/* メインエリア (スマホ幅想定) */}
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-xl border-x border-gray-200 flex flex-col relative">
        
        {/* ヘッダー */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Diary Feed</h1>
          <button 
            onClick={handleAddPage}
            className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl shadow-md hover:bg-blue-600 transition"
          >
            +
          </button>
        </div>

        {/* --- ページリスト (タイムライン) --- */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-20">
          {pages.map((page) => (
            <div 
              key={page.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-80 transition-transform hover:scale-[1.01]"
            >
              {/* 
                高さ固定(h-80)のコンテナの中にPreviewを入れる。
                Previewは h-full で親に追従する設計になっているため綺麗に収まる。
              */}
              <PageCanvasPreview
                page={page}
                onEditHeader={() => setEditingState({ pageId: page.id, target: 'meta' })}
                onEditCanvas={() => setEditingState({ pageId: page.id, target: 'canvas' })}
              />
            </div>
          ))}
          
          {pages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <p>ページがありません</p>
              <p className="text-sm">右上の + ボタンで作れます</p>
            </div>
          )}
        </div>
      </div>

      {/* --- 編集用モーダル (全画面オーバーレイ) --- */}
      {targetPage && editingState && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-10 duration-200">
          <PageCanvasEditor
            initialPage={targetPage}
            focusTarget={editingState.target}
            onSave={handleSave}
            onClose={() => setEditingState(null)}
          />
        </div>
      )}

    </div>
  );
}