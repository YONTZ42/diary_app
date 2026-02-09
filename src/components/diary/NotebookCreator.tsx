"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Book, Palette, Layout, Loader2 } from 'lucide-react';
import { Notebook } from '@/types/schema';
import { createNotebook } from '@/services/api'; // 追加

// ... (COVER_COLORS 定数はそのまま) ...
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
  onCreate: (notebook: Notebook) => void; // Partial<Notebook> から Notebook (確定済み) に変更推奨
}

export const NotebookCreator: React.FC<NotebookCreatorProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_COLORS[0].id);
  
  // 通信状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    const newNotebookData: Partial<Notebook> = {
      title,
      description,
      cover: { 
        kind: 'local', // 本来はremoteだが、プリセットキーとして扱うならlocalでもOK
        key: selectedCover, 
        mime: 'image/png' 
      },
      // pageIdsなどはバックエンドで初期化されるか、空配列で送る
      // Djangoモデルの `tags` や `viewSettings` のデフォルト値に依存
    };

    try {
      // API呼び出し
      const createdNotebook = await createNotebook(newNotebookData);
      
      // 成功したら親コンポーネントに通知して閉じる
      onCreate(createdNotebook);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to create notebook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Left: Preview Area (変更なし) */}
        <div className="w-full md:w-5/12 bg-[#F2F0E9] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative">
           <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</div>
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
        <div className="flex-1 p-8 flex flex-col overflow-y-auto relative">
          
          {/* ローディングオーバーレイ (送信中) */}
          {isSubmitting && (
            <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-900" size={32} />
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Book className="text-blue-600" size={24} />
              Create New Notebook
            </h2>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                placeholder="What is this notebook about?"
                rows={2}
                className="w-full text-sm border-b-2 border-gray-200 py-2 focus:border-blue-600 focus:outline-none transition-colors placeholder-gray-300 resize-none"
              />
            </div>

            {/* Color Picker (変更なし) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                <Palette size={14} /> Cover Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedCover(color.id)}
                    disabled={isSubmitting}
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

            {/* Template Selection (省略) */}
          </div>

          {/* Footer Action */}
          <div className="mt-8 flex justify-end">
             <button
               onClick={handleCreate}
               disabled={!title.trim() || isSubmitting}
               className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
             >
               <span>{isSubmitting ? 'Creating...' : 'Create Notebook'}</span>
               {!isSubmitting && <Check size={18} />}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};