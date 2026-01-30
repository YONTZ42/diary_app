"use client";

import React, { useState, useEffect } from 'react';
import { Notebook, Page } from '../types/schema';
import { NotebookShelf } from '../components/NotebookShelf';
import { NotebookReaderModal } from '../components/NotebookReaderModal';
import { generateMockNotebooks } from '../utils/dummyNotebooks';
import { generateMockPages } from '../utils/dummyData';

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]); // 本来はStore/DBから取得
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);

  // データロード
  useEffect(() => {
    setNotebooks(generateMockNotebooks());
    setAllPages(generateMockPages());
  }, []);

  // ジャンル別フィルタリング (タグなどを利用)
  const recentNotebooks = notebooks; // とりあえず全件
  const favoriteNotebooks = notebooks.filter(nb => nb.tags?.includes('Cafe') || nb.tags?.includes('Travel'));
  const workNotebooks = notebooks.filter(nb => nb.tags?.includes('Work') || nb.tags?.includes('Idea'));

  return (
    <div className="h-full overflow-auto bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="pt-12 pb-4 px-6 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-30">
        <div className="flex justify-between items-center">
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Library</h1>
           <button className="text-slate-400 hover:text-slate-600">
             🔍
           </button>
        </div>
      </div>

      {/* Shelves */}
      <div className="mt-2 space-y-2">
        <NotebookShelf 
          title="Recently Updated" 
          notebooks={recentNotebooks} 
          onSelect={setSelectedNotebook} 
        />
        
        <NotebookShelf 
          title="Favorites & Life Log" 
          notebooks={favoriteNotebooks} 
          onSelect={setSelectedNotebook} 
        />

        <NotebookShelf 
          title="Work & Ideas" 
          notebooks={workNotebooks} 
          onSelect={setSelectedNotebook} 
        />
      </div>

      {/* New Notebook Button (Floating) */}
      <div className="fixed bottom-24 right-6 z-20">
        <button className="bg-slate-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform">
          ＋
        </button>
      </div>

      {/* Reader Modal */}
      {selectedNotebook && (
        <NotebookReaderModal
          notebook={selectedNotebook}
          allPages={allPages}
          onClose={() => setSelectedNotebook(null)}
        />
      )}
    </div>
  );
}