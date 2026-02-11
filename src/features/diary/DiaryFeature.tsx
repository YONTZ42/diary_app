"use client";

import React, { useState, useEffect } from 'react';
import { NotebookCard } from '@/components/diary/NotebookCard';
import { BookReader } from '@/components/diary/BookReader';
import { Notebook, Page } from '@/types/schema';
import { NotebookCreator } from '@/components/diary/NotebookCreator';
import { PlusIcon } from '@heroicons/react/24/solid';
import { fetchNotebooks, createPage, updatePage, fetchPagesInNotebook, deletePage } from '@/services/api';
import { Loader2 } from 'lucide-react';

const uuid = () => Math.random().toString(36).substring(2, 9);

export const DiaryFeature = () => {
  // Notebooks (棚)
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  
  // 現在開いているNotebookのページ一覧
  const [activePages, setActivePages] = useState<Page[]>([]);
  
  // 状態フラグ
  const [loadingShelf, setLoadingShelf] = useState(true); // 棚のロード
  const [loadingBook, setLoadingBook] = useState(false);  // 本のロード
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  
  const [openedNotebookId, setOpenedNotebookId] = useState<string | null>(null);
  
  // 開いているNotebookオブジェクト
  const activeNotebook = notebooks.find(nb => nb.id === openedNotebookId);

  // --- 1. 初期ロード (棚の取得のみ) ---
  useEffect(() => {
    const loadShelf = async () => {
      try {
        setLoadingShelf(true);
        const data = await fetchNotebooks();
        setNotebooks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch notebooks:", error);
        setNotebooks([]);
      } finally {
        setLoadingShelf(false);
      }
    };
    loadShelf();
  }, []);

  // --- 2. Notebookを開く処理 ---
  const handleOpenNotebook = async (notebookId: string) => {
    setOpenedNotebookId(notebookId);
    setLoadingBook(true); // 読み込み開始
    setActivePages([]);   // クリア

    try {
      // 必要なページだけを取得
      const pages = await fetchPagesInNotebook(notebookId);
      setActivePages(Array.isArray(pages) ? pages : []);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoadingBook(false);
    }
  };

  // --- Handlers ---

  const handleCloseBook = () => {
    setOpenedNotebookId(null);
    setActivePages([]); // メモリ解放も兼ねてクリア
  };

  const handleCreateNotebook = (newNotebook: Notebook) => {
    setNotebooks(prev => [newNotebook, ...prev]);
  };

  const handleUpdatePage = async (updatedPage: Page) => {
    // ローカル更新 (BookReader内の表示用)
    setActivePages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
    
    // API更新
    try {
      await updatePage(updatedPage.id, updatedPage);
    } catch (error) {
      console.error("Failed to update page:", error);
    }
  };

  const handleCreatePage = async (notebookId: string) => {
    const newPageData: Partial<Page> = {
      type: 'diary',
      date: new Date().toISOString().split('T')[0],
      title: 'New Page',
      note: '',
      sceneData: { elements: [], appState: { viewBackgroundColor: "#fafafa" } },
      assets: {},
      usedStickerIds: [],
    };

    try {
      const createdPage = await createPage(newPageData, notebookId);
      
      // 1. 開いている本に追加
      setActivePages(prev => [...prev,createdPage ]); // 先頭に追加（API側もDESC順なら）

      // 2. 棚の情報（ページ数など）も更新
      setNotebooks(prev => prev.map(nb => {
        if (nb.id === notebookId) {
          return { ...nb, pageIds: [...(nb.pageIds || []), createdPage.id] };
        }
        return nb;
      }));

    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    // 1. ローカルStateから削除
    // BookReader内のページリストから削除する
    setActivePages(prev => prev.filter(p => p.id !== pageId));
    
    // 2. APIで削除
    try {
      await deletePage(pageId);
      console.log(`API call to delete page ${pageId} would go here.`);
      // 成功したらBookReaderを閉じるか、そのまま
      // setEditingPageId(null); // BookReader側で閉じる処理が必要
    } catch (error) {
      console.error("Failed to delete page:", error);
      // 失敗したらロールバック（再取得など）
    }
  };


  // --- Render ---

  if (loadingShelf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  // 本を開いている状態
  if (activeNotebook) {
    // ページロード中はローディング表示（または空のReader）
    if (loadingBook) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F2F0E9]">
                <Loader2 className="animate-spin text-gray-500" size={32} />
                <span className="ml-2 text-gray-500 font-serif">Opening {activeNotebook.title}...</span>
            </div>
        );
    }

    return (
      <BookReader
        notebook={activeNotebook}
        initialPages={activePages}
        onClose={handleCloseBook}
        onUpdatePage={handleUpdatePage}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
      />
    );
  }

  // 棚（一覧）の状態
  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-24">
      <div className="p-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800">My Shelf</h1>
            <p className="text-gray-500 text-sm mt-1">
              {notebooks?.length || 0} notebooks
            </p>
          </div>
          <button 
            onClick={() => setIsCreatorOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Book</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {notebooks?.length > 0 ? (
              notebooks.map(nb => (
              <NotebookCard
                  key={nb.id}
                  notebook={nb}
                  onClick={() => handleOpenNotebook(nb.id)} // ここでロード開始
              />
              ))
          ) : (
              <div className="col-span-full py-10 text-center text-gray-400">
                No notebooks yet. Create your first one!
              </div>
          )}
        </div>
      </div>

      {isCreatorOpen && (
        <NotebookCreator
          onClose={() => setIsCreatorOpen(false)}
          onCreate={handleCreateNotebook}
        />
      )}
    </main>
  );
}