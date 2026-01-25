"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  MagazinePreview, 
  EditorPanel, 
  Article 
} from '../_components/diary_and_editor_component'; 
import { 
    createShapeId,
  Editor, 
  getSnapshot, 
  loadSnapshot 
} from 'tldraw';
import 'tldraw/tldraw.css';
import { Plus, X, Check } from 'lucide-react';

const UI_OVERRIDES = {
  translations: {
    ja: {
      'style-panel.fill-style.lined-fill': '斜線',
      'fill-style.lined-fill': '斜線',
      // その他、不足しているキーがあればここに追加
    },
  },
};

const PAGE_BOUNDS = { x: 0, y: 0, w: 600, h: 800 };




const TldrawEditor = dynamic(() => import('tldraw').then((m) => m.Tldraw), { ssr: false });

type ExtendedArticle = Article & {
  snapshot?: any; 
};

// --- サブコンポーネント: 描画専用モーダル ---
const DrawingModal = ({
  initialSnapshot,
  onSave,
  onClose
}: {
  initialSnapshot: any;
  onSave: (snapshot: any) => void;
  onClose: () => void;
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
    if (initialSnapshot) {
      try {
        loadSnapshot(editorInstance.store, initialSnapshot);
      } catch (e) { console.error(e); }
    }

    const frameId = createShapeId('page-frame');
    const existingFrame = editorInstance.getShape(frameId);

    if (!existingFrame) {
      editorInstance.createShapes([{
        id: frameId,
        type: 'geo',
        x: PAGE_BOUNDS.x,
        y: PAGE_BOUNDS.y,
        props: {
          w: PAGE_BOUNDS.w,
          h: PAGE_BOUNDS.h,
          geo: 'rectangle',
          color: 'grey', // 薄いグレー
          fill: 'none',
          dash: 'dashed', // 点線
          size: 's',
        },
        // 誤操作防止のためにロックする
        isLocked: true 
      }]);
    }
    setTimeout(() => {
        editorInstance.zoomToBounds(PAGE_BOUNDS, { animation: { duration: 0 }, inset: 50 });
    }, 100);



  }, [initialSnapshot]);

  const handleSave = () => {
    if (editor) {
      const snapshot = getSnapshot(editor.store);
      onSave(snapshot);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#e5e5e5] flex flex-col items-center justify-center">
      {/* 背景クリックで閉じないようにコンテンツエリアを定義 */}
      <div className="w-full h-full max-w-[1200px] max-h-[900px] bg-white shadow-2xl flex flex-col relative rounded-xl overflow-hidden border border-stone-300">
        
        {/* ヘッダー */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-stone-200 bg-white z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Sketching Area (600 x 800)
          </span>
          <div className="flex gap-2">
             <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 transition-colors">
                <X size={20} />
             </button>
             <button onClick={handleSave} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-colors">
                <Check size={14} /> Save
             </button>
          </div>
        </div>
        
        {/* Tldraw キャンバス */}
        <div className="flex-1 relative bg-[#fcfaf8] touch-none" >
          <TldrawEditor 
            onMount={handleMount}
            hideUi={false} 
            overrides={UI_OVERRIDES}
            inferDarkMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default function DiaryPage() {
  // 初期データ: 複数枚のカードを用意
  const [articles, setArticles] = useState<ExtendedArticle[]>([
    {
      id: '1',
      date: Date.now(),
      title: 'Design Concept',
      content: 'カードレイアウトのラフスケッチ。',
      imageUrl: '',
      color: '#ff9f43',
      rating: 85,
      snapshot: null
    },
    {
      id: '2',
      date: Date.now() - 86400000,
      title: 'Meeting Notes',
      content: '昨日のミーティングのメモ書き。',
      imageUrl: '',
      color: '#54a0ff',
      rating: 60,
      snapshot: null
    },
    {
      id: '3',
      date: Date.now() - 172800000,
      title: 'Idea Box',
      content: '思いついたアイデアを書き留める場所。',
      imageUrl: '',
      color: '#ee5253',
      rating: 90,
      snapshot: null
    }
  ]);

  const [editState, setEditState] = useState<{
    id: string;
    mode: 'draw' | 'text';
  } | null>(null);

  const targetArticle = editState ? articles.find(a => a.id === editState.id) : null;

  const handleSaveDrawing = (newSnapshot: any) => {
    if (!editState) return;
    setArticles(prev => prev.map(a => 
      a.id === editState.id ? { ...a, snapshot: newSnapshot } : a
    ));
  };

  const handleSaveText = (updatedArticle: Article) => {
    setArticles(prev => prev.map(a => 
      a.id === updatedArticle.id ? { ...a, ...updatedArticle } : a
    ));
  };

  const handleAdd = () => {
    const newId = crypto.randomUUID();
    const newArticle: ExtendedArticle = {
      id: newId,
      date: Date.now(),
      title: 'New Entry',
      content: '新規作成されたカードです。上のエリアをクリックして描画を開始してください。',
      imageUrl: '',
      color: '#000000',
      rating: 50,
      snapshot: null
    };
    setArticles([newArticle, ...articles]);
    setEditState({ id: newId, mode: 'draw' });
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">My Sketch Diary</h1>
          <p className="text-stone-500 text-sm tracking-widest uppercase">Grid Layout Demo</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-full hover:bg-stone-700 active:scale-95 transition-all shadow-lg"
        >
          <Plus size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">New Entry</span>
        </button>
      </header>

      {/* グリッドレイアウト: 複数並べる設定 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="group relative">
            <MagazinePreview 
              article={article}
              readOnly={true}
              useTldraw={true}
              snapshot={article.snapshot}
              onImageClick={() => setEditState({ id: article.id, mode: 'draw' })}
              onContentClick={() => setEditState({ id: article.id, mode: 'text' })}
              // ホバー時のアニメーション
              styleClass="aspect-[3/4] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            />
          </div>
        ))}
      </div>

      {/* モーダル群 */}
      {editState?.mode === 'draw' && targetArticle && (
        <DrawingModal 
          initialSnapshot={targetArticle.snapshot}
          onSave={handleSaveDrawing}
          onClose={() => setEditState(null)}
        />
      )}

      {editState?.mode === 'text' && targetArticle && (
        <EditorPanel 
          article={targetArticle}
          onChange={handleSaveText}
          onClose={() => setEditState(null)}
        />
      )}
    </div>
  );
}
