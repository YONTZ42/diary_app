"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Book, Palette, Layout, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { Notebook, AssetRef } from '@/types/schema';
import { createNotebook } from '@/services/api';
import { useImageUpload } from '@/hooks/useImageUpload'; // 新規フック
import Image from 'next/image';

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
  onCreate: (notebook: Notebook) => void;
}

export const NotebookCreator: React.FC<NotebookCreatorProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(COVER_COLORS[0].id);
  
  // アップロード画像の状態
  const [coverImage, setCoverImage] = useState<{ url: string, width: number, height: number } | null>(null);
  const { uploadImage, isUploading: isImageUploading } = useImageUpload();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 画像選択ハンドラ
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, 'notebook_cover');
      setCoverImage(result);
    } catch (err) {
      // エラーはフック内で設定されるが、ここでもキャッチ可能
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);

    // AssetRefの構築
    let coverAsset: AssetRef;
    
    if (coverImage) {
      // アップロード画像を使用
      coverAsset = {
        kind: 'remote',
        key: coverImage.url,
        mime: 'image/png', // 簡易
        width: coverImage.width,
        height: coverImage.height,
      };
    } else {
      // 色プリセットを使用 (local扱い)
      coverAsset = {
        kind: 'local',
        key: selectedColorId,
        mime: 'image/png',
      };
    }

    const newNotebookData: Partial<Notebook> = {
      title,
      description,
      cover: coverAsset,
      pageIds: [],
    };

    try {
      const createdNotebook = await createNotebook(newNotebookData);
      onCreate(createdNotebook);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to create notebook.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedColorBg = COVER_COLORS.find(c => c.id === selectedColorId)?.bg || 'bg-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]"
      >
        {/* Left: Magazine Preview Area */}
        <div className="w-full md:w-5/12 bg-[#F2F0E9] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative overflow-hidden">
           <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest z-10">Preview</div>
           
           {/* Notebook Cover Preview */}
           <div className={`relative w-56 aspect-[3/4] rounded-r-xl rounded-l-sm shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${!coverImage ? selectedColorBg : 'bg-white'}`}>
              
              {/* 背景画像 */}
              {coverImage ? (
                <div className="absolute inset-0">
                  <Image src={coverImage.url} alt="Cover" fill className="object-cover" />
                  {/* 雑誌風のグラデーションオーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </div>
              ) : (
                // テクスチャオーバーレイ (色のみの場合)
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay" />
              )}

              {/* バンド（装飾） */}
              <div className="absolute right-3 top-0 bottom-0 w-3 bg-black/10 z-10 mix-blend-multiply" />
              
              {/* タイトル配置 (雑誌風レイアウト) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                {/* 帯 (色選択が反映される) */}
                <div className={`h-1 w-16 mb-4 ${selectedColorBg.replace('bg-', 'bg-')}`} />
                
                <h3 className="text-white font-serif font-bold text-3xl leading-tight drop-shadow-lg break-words line-clamp-3">
                  {title || "Untitled"}
                </h3>
                {description && (
                  <p className="text-white/80 text-xs mt-3 font-sans line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* ローディング表示 */}
              {isImageUploading && (
                <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center flex-col text-white">
                  <Loader2 className="animate-spin mb-2" />
                  <span className="text-xs font-bold">Uploading...</span>
                </div>
              )}
           </div>
        </div>

        {/* Right: Form Area */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Book className="text-blue-600" size={24} />
              Create Notebook
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. 2024 Diary"
                className="w-full text-2xl font-serif font-bold border-b-2 border-gray-200 py-2 focus:border-blue-600 focus:outline-none transition-colors placeholder-gray-300"
                autoFocus
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Cover Image</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl transition-all active:scale-95">
                  <ImageIcon size={18} />
                  <span className="text-sm font-bold">Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isImageUploading} />
                </label>
                
                {coverImage && (
                  <button 
                    onClick={() => setCoverImage(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Accent Color Picker (画像がある場合はアクセントカラーとして使用) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                {coverImage ? 'Accent Color' : 'Cover Color'}
              </label>
              <div className="flex flex-wrap gap-3">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColorId(color.id)}
                    className={`w-10 h-10 rounded-full ${color.bg} relative shadow-sm transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${selectedColorId === color.id ? 'ring-blue-500 scale-110' : 'ring-transparent'}`}
                  >
                    {selectedColorId === color.id && <Check size={16} className="text-white absolute inset-0 m-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-sm border-b-2 border-gray-200 py-2 focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 flex justify-end items-center gap-4">
             {error && <span className="text-red-500 text-sm">{error}</span>}
             <button
               onClick={handleCreate}
               disabled={!title.trim() || isSubmitting || isImageUploading}
               className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
             >
               {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={18} />}
               <span>Create</span>
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};