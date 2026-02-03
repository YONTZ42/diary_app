"use client";

import React from "react";
import { PageCanvasPreview } from "@/components/canvas/PageCanvasPreview";
import { MOCK_PAGES } from "@/utils/dummyDiary"; // パスは保存場所に合わせて調整
import { Plus, Filter } from "lucide-react";

export default function DiaryListPage() {
  // モックデータを使用
  const pages = MOCK_PAGES;

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 md:p-10">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
              My Collection
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              {pages.length} Entries in 2024
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
              <Filter size={20} />
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-md active:scale-95">
              <Plus size={20} />
              <span className="font-bold text-sm">Create New</span>
            </button>
          </div>
        </div>

        {/* Tags Quick Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'cafe', 'movie', 'art', 'walk'].map((tag) => (
            <span key={tag} className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-500 cursor-pointer hover:border-blue-200 hover:text-blue-500 transition shadow-sm whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Grid Display */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
          {pages.map((page) => (
            <div 
              key={page.id} 
              className="h-[600px] transition-transform duration-500 hover:-translate-y-2"
            >
              <PageCanvasPreview
                page={page}
                onEditCanvas={() => console.log("Edit Canvas:", page.id)}
                onEditHeader={() => console.log("Edit Header:", page.id)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}