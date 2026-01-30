"use client";

import React from 'react';
import { Notebook } from '../types/schema';

interface NotebookShelfProps {
  title: string;
  notebooks: Notebook[];
  onSelect: (notebook: Notebook) => void;
}

export const NotebookShelf: React.FC<NotebookShelfProps> = ({ title, notebooks, onSelect }) => {
  return (
    <div className="mb-8">
      {/* Shelf Title */}
      <h2 className="px-6 mb-3 text-lg font-bold text-slate-800 flex items-center gap-2">
        {title} <span className="text-slate-400 text-xs font-normal">({notebooks.length})</span>
      </h2>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto pb-6 px-6 gap-4 hide-scrollbar snap-x snap-mandatory">
        {notebooks.map((nb) => (
          <div 
            key={nb.id}
            onClick={() => onSelect(nb)}
            className="snap-start shrink-0 w-[140px] flex flex-col group cursor-pointer"
          >
            {/* Cover Image (Card) */}
            <div className="relative aspect-[3/4] bg-slate-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl border border-slate-100">
              {nb.cover ? (
                <img 
                  src={nb.cover.key} 
                  alt={nb.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">
                  📖
                </div>
              )}
              
              {/* Badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                {nb.pageIds.length} P
              </div>
            </div>

            {/* Title & Meta */}
            <div className="mt-2 px-1">
              <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">
                {nb.title}
              </h3>
              {nb.tags && nb.tags.length > 0 && (
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {nb.tags.join(' • ')}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Padding for end of scroll */}
        <div className="shrink-0 w-2" />
      </div>
    </div>
  );
};