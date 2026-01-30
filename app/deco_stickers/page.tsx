"use client";

import React, { useState, useEffect } from 'react';
import { Sticker } from '../types/schema';
import { generateMockStickers } from '../utils/dummyStickers';

type Tab = 'all' | 'favorite' | 'recent';

export default function StickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setStickers(generateMockStickers());
  }, []);

  // フィルタリング処理
  const filteredStickers = stickers.filter(sticker => {
    // 1. タブによるフィルタ
    if (activeTab === 'favorite' && !sticker.favorite) return false;
    
    // 2. 検索語句によるフィルタ
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = sticker.name?.toLowerCase().includes(q);
      const matchTag = sticker.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchTag) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Recentタブなら使用回数や更新日でソート（今回は簡易的に使用回数）
    if (activeTab === 'recent') {
      return (b.usageCount || 0) - (a.usageCount || 0);
    }
    return 0;
  });

  // お気に入りトグル処理
  const toggleFavorite = (id: string) => {
    setStickers(prev => prev.map(s => 
      s.id === id ? { ...s, favorite: !s.favorite } : s
    ));
  };

  return (
    <div className="h-full overflow-auto bg-slate-50 flex flex-col">
      
      {/* 1. Header Area */}
      <div className="pt-12 pb-4 px-6 bg-white shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stickers</h1>
          <button className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform">
            ＋ Cut New
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search stickers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl py-3 px-4 pl-10 text-slate-700 font-medium focus:ring-2 focus:ring-slate-200 transition-all"
          />
          <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto pb-1 hide-scrollbar">
          {(['all', 'favorite', 'recent'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab 
                  ? 'border-slate-800 text-slate-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Grid Content (Drawer) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredStickers.map((sticker) => (
            <div key={sticker.id} className="group relative flex flex-col items-center">
              
              {/* Sticker Card */}
              <div 
                className="w-full aspect-square bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1"
                // 背景の市松模様（透過表現）
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {/* 
                  画像表示: Sticker.style (outline/shadow) をCSS filterで簡易再現 
                */}
                <img 
                  src={sticker.png.key} 
                  alt={sticker.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: `
                      ${sticker.style.shadow.enabled 
                          ? `drop-shadow(${sticker.style.shadow.offsetX}px ${sticker.style.shadow.offsetY}px ${sticker.style.shadow.blur}px rgba(0,0,0,${sticker.style.shadow.opacity}))` 
                          : ''}
                      ${sticker.style.outline.enabled
                          ? `drop-shadow(0px 0px ${sticker.style.outline.size}px ${sticker.style.outline.color}) drop-shadow(0px 0px 1px ${sticker.style.outline.color})` 
                          : ''}
                    `
                  }}
                />

                {/* Favorite Button (Overlay) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(sticker.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-90 transition-transform"
                >
                  <span className={sticker.favorite ? "text-red-500 scale-110" : "text-slate-300 hover:text-red-300"}>
                    ♥
                  </span>
                </button>
              </div>

              {/* Meta Info */}
              <div className="mt-2 text-center w-full">
                <p className="text-sm font-bold text-slate-700 truncate">{sticker.name}</p>
                <div className="flex justify-center gap-1 mt-1 flex-wrap">
                  {sticker.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {filteredStickers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm font-medium">No stickers found</p>
          </div>
        )}
      </div>
    </div>
  );
}