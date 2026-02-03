"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Book, Palette, Layout } from 'lucide-react';
import { Notebook } from '@/types/schema';

// 表紙カラーのプリセット
const COVER_COLORS = [
  { id: 'cover-blue', bg: 'bg-slate-700', name: 'Midnight' },
  { id: 'cover-red', bg: 'bg-rose-800', name: 'Crimson' },
  { id: 'cover-green', bg: 'bg-emerald-800', name: 'Forest' },
  { id: 'cover-orange', bg: 'bg-orange-700', name: 'Sunset' },
  { id: 'cover-black', bg: 'bg-gray-900', name: 'Onyx' },
  { id: 'cover-brown', bg: 'bg-amber-900', name: 'Leather' },
];

interface NotebookCreatorProps {
  onClose: () => void;
  onCreate: (notebook: Partial<Notebook>) => void;
}

export const NotebookCreator: React.FC<NotebookCreatorProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_COLORS[0].id);

  const handleCreate = () => {
    if (!title.trim()) return;

    const newNotebook: Partial<Notebook> = {
      title,
      description,
      // 表紙データをAssetRef形式で保存
      cover: { 
        kind: 'local', 
        key: selectedCover, 
        mime: 'image/png' 
      },
      pageIds: [],
    };
    
    onCreate(newNotebook);
    onClose();
  };

  const selectedColorBg = COVER_COLORS.find(c => c.id === selectedCover)?.bg || 'bg-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left: Preview Area */}
        <div className="w-full md:w-5/12 bg-[#F2F0E9] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative">
           <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</div>
           
           {/* Notebook Preview */}
           <div className={`relative w-40 h-56 rounded-r-xl rounded-l-sm shadow-2xl ${selectedColorBg} flex flex-col p-5 border-l-4 border-l-black/20 transition-colors duration-300`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay" />
              <div className="absolute right-3 top-0 bottom-0 w-3 bg-black/10" />
              
              <div className="mt-8 z-10">
                <h3 className="text-white font-serif font-bold text-xl leading-tight drop-shadow-md break-words">
                  {title || "Untitled"}
                </h3>
                <p className="text-white/70 text-xs mt-2 font-sans line-clamp-3">
                  {description}
                </p>
              </div>
           </div>
        </div>

        {/* Right: Form Area */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Book className="text-blue-600" size={24} />
              Create New Notebook
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. 2024 Diary"
                className="w-full text-lg border-b-2 border-gray-200 py-2 focus:border-blue-600 focus:outline-none transition-colors placeholder-gray-300 font-serif"
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Description <span className="text-gray-300 font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this notebook about?"
                rows={2}
                className="w-full text-sm border-b-2 border-gray-200 py-2 focus:border-blue-600 focus:outline-none transition-colors placeholder-gray-300 resize-none"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                <Palette size={14} /> Cover Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedCover(color.id)}
                    className={`w-10 h-10 rounded-full ${color.bg} relative shadow-sm transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${selectedCover === color.id ? 'ring-blue-500 scale-110' : 'ring-transparent'}`}
                    title={color.name}
                  >
                    {selectedCover === color.id && (
                      <Check size={16} className="text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection (Mock) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                <Layout size={14} /> Paper Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                 <button className="border-2 border-blue-100 bg-blue-50/50 p-3 rounded-xl text-left text-sm font-bold text-blue-800 ring-1 ring-blue-500">
                    Blank
                 </button>
                 <button className="border border-gray-200 p-3 rounded-xl text-left text-sm text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-60">
                    Dot Grid (Pro)
                 </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 flex justify-end">
             <button
               onClick={handleCreate}
               disabled={!title.trim()}
               className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
             >
               <span>Create Notebook</span>
               <Check size={18} />
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};