"use client";

import React, { useState } from 'react';
import { NotebookCard } from '@/components/diary/NotebookCard';
import { BookReader } from '@/components/diary/BookReader';
import { NotebookCreator } from '@/components/diary/NotebookCreator';
import { MOCK_NOTEBOOKS, MOCK_PAGES } from '@/utils/dummyDiary';
import { Notebook, Page } from '@/types/schema';
import { Plus } from 'lucide-react';

const uuid = () => Math.random().toString(36).substring(2, 9);

export const DiaryFeature = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>(MOCK_NOTEBOOKS);
  const [allPages, setAllPages] = useState<Page[]>(MOCK_PAGES);
  const [openedNotebookId, setOpenedNotebookId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const activeNotebook = notebooks.find(nb => nb.id === openedNotebookId);
  const activePages = activeNotebook 
    ? activeNotebook.pageIds.map(id => allPages.find(p => p.id === id)).filter((p): p is Page => !!p)
    : [];

  const handleUpdatePage = (updatedPage: Page) => {
    setAllPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const handleCreatePage = (notebookId: string) => {
    const newPage: Page = {
      id: uuid(),
      type: 'diary',
      date: new Date().toISOString().split('T')[0],
      title: '', note: '', sceneData: {}, assets: {}, usedStickerIds: [],
      preview: { kind: 'local', key: '', mime: 'image/png' },
      schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setAllPages(prev => [...prev, newPage]);
    setNotebooks(prev => prev.map(nb => nb.id === notebookId ? { ...nb, pageIds: [...nb.pageIds, newPage.id] } : nb));
  };

  const handleCreateNotebook = (notebookData: Partial<Notebook>) => {
    const newNb: Notebook = {
      id: uuid(),
      title: notebookData.title || 'Untitled',
      description: notebookData.description,
      pageIds: [],
      schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      cover: notebookData.cover || { kind: 'local', key: 'cover-blue', mime: 'image/png' },
      tags: [],
    };
    setNotebooks([...notebooks, newNb]);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-6 pb-32">
      {activeNotebook ? (
        <BookReader
          notebook={activeNotebook}
          initialPages={activePages}
          onClose={() => setOpenedNotebookId(null)}
          onUpdatePage={handleUpdatePage}
          onCreatePage={handleCreatePage}
        />
      ) : (
        <>
          <div className="flex items-end justify-between mb-8 sticky top-0 z-10 bg-[#F9F8F6]/90 backdrop-blur py-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-800">My Shelf</h1>
              <p className="text-gray-500 text-sm mt-1">{notebooks.length} notebooks</p>
            </div>
            <button 
              onClick={() => setIsCreatorOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /><span>New Book</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {notebooks.map(nb => (
              <NotebookCard key={nb.id} notebook={nb} onClick={() => setOpenedNotebookId(nb.id)} />
            ))}
          </div>

          {isCreatorOpen && (
            <NotebookCreator onClose={() => setIsCreatorOpen(false)} onCreate={handleCreateNotebook} />
          )}
        </>
      )}
    </div>
  );
};