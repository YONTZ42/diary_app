"use client";

import React, { useState } from 'react';
import { MOCK_USERS, User } from '@/utils/dummyFriends';
import { MOCK_PAGES } from '@/utils/dummyDiary';
import { FriendsTimeline } from '@/components/friends/FriendsTimeline';
import { FriendShelf } from '@/components/friends/FriendShelf';
import { BookReader } from '@/components/diary/BookReader';
import { Notebook, Page } from '@/types/schema';

export default function FriendsPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [readingNotebook, setReadingNotebook] = useState<Notebook | null>(null);

  // ユーザー選択 (本棚へ移動)
  const handleSelectUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) setSelectedUser(user);
  };

  // ノートブックを開く (BookReaderへ移動)
  const handleOpenNotebook = (notebook: Notebook) => {
    setReadingNotebook(notebook);
  };

  // 閲覧中のノートブックのページデータを取得
  // (実際はAPIで fetchPages(notebookId) する)
  const readingPages = readingNotebook 
    ? readingNotebook.pageIds.map(id => MOCK_PAGES.find(p => p.id === id)).filter((p): p is Page => !!p)
    : [];

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F9F8F6]/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <h1 className="font-serif font-bold text-2xl text-gray-800">Friends</h1>
      </div>

      {/* Main Feed */}
      <FriendsTimeline 
        onSelectUser={handleSelectUser}
        onOpenNotebook={handleOpenNotebook}
      />

      {/* --- Overlays --- */}

      {/* 1. Friend's Shelf (User Profile) */}
      {selectedUser && (
        <FriendShelf 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onOpenNotebook={handleOpenNotebook}
        />
      )}

      {/* 2. Reading Mode (BookReader) */}
      {readingNotebook && (
        // 他人の手帳なので、編集機能(onCreatePage, onUpdatePage)はダミーまたは無効化
        // BookReader内部で「編集ボタン」を非表示にするフラグが必要かもだが、
        // 今回は「見るだけ」として機能させる
        <BookReader
          notebook={readingNotebook}
          initialPages={readingPages}
          onClose={() => setReadingNotebook(null)}
          onUpdatePage={() => {}} // 読み取り専用なら何もしない
          onCreatePage={() => {}} // 読み取り専用なら何もしない
        />
      )}
    </main>
  );
}