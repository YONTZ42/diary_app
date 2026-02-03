"use client";

import React, { useState } from 'react';
import { MOCK_USERS, User } from '@/utils/dummyFriends';
import { MOCK_PAGES } from '@/utils/dummyDiary';
import { FriendsTimeline } from '@/components/friends/FriendsTimeline';
import { FriendShelf } from '@/components/friends/FriendShelf';
import { BookReader } from '@/components/diary/BookReader';
import { Notebook, Page } from '@/types/schema';

export const FriendsFeature = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [readingNotebook, setReadingNotebook] = useState<Notebook | null>(null);
  
  const readingPages = readingNotebook 
    ? readingNotebook.pageIds.map(id => MOCK_PAGES.find(p => p.id === id)).filter((p): p is Page => !!p)
    : [];

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-32">
      <div className="sticky top-0 z-20 bg-[#F9F8F6]/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <h1 className="font-serif font-bold text-2xl text-gray-800">Friends</h1>
      </div>

      <FriendsTimeline onSelectUser={(id) => setSelectedUser(MOCK_USERS.find(u => u.id === id) || null)} onOpenNotebook={setReadingNotebook} />

      {selectedUser && <FriendShelf user={selectedUser} onClose={() => setSelectedUser(null)} onOpenNotebook={setReadingNotebook} />}
      
      {readingNotebook && (
        <BookReader
          notebook={readingNotebook} initialPages={readingPages} onClose={() => setReadingNotebook(null)}
          onUpdatePage={() => {}} onCreatePage={() => {}}
        />
      )}
    </div>
  );
};