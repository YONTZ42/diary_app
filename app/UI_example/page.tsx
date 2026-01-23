"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Book, Calendar as CalendarIcon, Grid, Settings2, Check } from 'lucide-react';

// --- メインコンポーネント ---
const AppContainer = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'calendar'>('library');
  const [editingMagazine, setEditingMagazine] = useState<any | null>(null);

  return (
    <div className="h-screen w-screen bg-[#F8F7F2] flex flex-col overflow-hidden">
      
      {/* 編集画面（フルスクリーン・オーバーレイ） */}
      <AnimatePresence>
        {editingMagazine && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <MagazineEditor 
              magazine={editingMagazine} 
              onClose={() => setEditingMagazine(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* メインコンテンツエリア */}
      <main className="flex-grow overflow-y-auto pb-20">
        {activeTab === 'library' ? (
          <MagazineLibrary onSelect={(mag) => setEditingMagazine(mag)} />
        ) : (
          <div className="p-10 text-center font-serif italic text-gray-400">
             Calendar View (Input Area)
          </div>
        )}
      </main>

      {/* 下部 2タブナビゲーション */}
      <nav className="h-20 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-10 fixed bottom-0 w-full z-40">
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-black' : 'text-gray-300'}`}
        >
          <Book size={24} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Library</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-black' : 'text-gray-300'}`}
        >
          <CalendarIcon size={24} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Calendar</span>
        </button>
      </nav>
    </div>
  );
};

// --- ライブラリ画面 ---
const MagazineLibrary = ({ onSelect }: { onSelect: (mag: any) => void }) => {
  const magazines = [
    { id: 'w1', title: 'WEEKLY 03.11', type: 'weekly', cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
    { id: 's1', title: 'Travel in Kyoto', type: 'special', cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
  ];

  return (
    <div className="p-8 space-y-10">
      <header className="flex justify-between items-end">
        <h1 className="text-3xl font-serif font-bold italic tracking-tighter">Archive</h1>
        <button className="p-2 bg-black text-white rounded-full"><Plus size={20} /></button>
      </header>

      <section className="grid grid-cols-2 gap-6">
        {magazines.map((mag) => (
          <div key={mag.id} onClick={() => onSelect(mag)} className="space-y-3 cursor-pointer group">
            <div className="aspect-[3/4] bg-gray-200 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
              <img src={mag.cover} className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{mag.type}</p>
            <p className="font-serif text-sm font-bold">{mag.title}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

// --- 編集画面（エディタ） ---
const MagazineEditor = ({ magazine, onClose }: { magazine: any, onClose: () => void }) => {
  return (
    <div className="h-full flex flex-col bg-[#F4F4F4]">
      {/* エディタヘッダー */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <button onClick={onClose} className="text-sm font-serif italic text-gray-500 underline">Close</button>
        <div className="text-center">
          <p className="text-[10px] font-mono text-gray-400 leading-none">Editing {magazine.type}</p>
          <p className="text-xs font-bold font-serif">{magazine.title}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-black text-white rounded-full"><Check size={16} /></button>
      </header>

      {/* 編集メインエリア */}
      <div className="flex-grow flex flex-col p-4 gap-4 overflow-hidden">
        {/* 雑誌のページプレビュー */}
        <div className="flex-grow bg-white shadow-inner flex items-center justify-center p-4">
           <div className="w-full max-w-xs aspect-[3/4] bg-gray-50 shadow-2xl border flex items-center justify-center relative">
              <p className="text-xs italic text-gray-300">Page Preview Area</p>
              {/* ここに以前作った AdaptiveJournalEntry が入る */}
           </div>
        </div>

        {/* 素材トレイ（特集号の場合） */}
        <div className="h-48 bg-white/50 backdrop-blur-md rounded-t-3xl border-t border-white p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Stock from Calendar</span>
            <Grid size={14} className="text-gray-400" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-shrink-0 w-24 aspect-square bg-white shadow-sm border border-white p-1">
                <div className="w-full h-full bg-gray-100 overflow-hidden relative">
                   <img src={`https://picsum.photos/seed/${i+10}/200`} className="w-full h-full object-cover opacity-50" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Plus size={12} className="text-gray-400" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppContainer;