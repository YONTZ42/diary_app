"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Book, Clock, Heart } from 'lucide-react';
import { BookReader } from '@/components/diary/BookReader';
import { NotebookCard } from '@/components/diary/NotebookCard'; // 既存のカードを再利用

// --- Type Definitions (Based on Schema) ---

type UUID = string;
type DateTime = string;

interface AssetRef {
  kind: 'local' | 'remote';
  key: string;
  mime: string;
  width?: number;
  height?: number;
}

interface Page {
  id: UUID;
  owner: UUID;
  type: 'diary' | 'schedule' | 'free';
  date: string;
  title?: string;
  note?: string;
  sceneData?: any; // 簡易化
  assets: Record<string, AssetRef>;
  preview?: AssetRef | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Notebook {
  id: UUID;
  owner: UUID;
  title: string;
  description?: string;
  cover?: AssetRef | null;
  pageIds: UUID[];
  visibility?: 'private' | 'friends' | 'public';
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface User {
  id: UUID;
  name: string;
  avatar: string; // URL
  bio: string;
}

// --- Dummy Data ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://placehold.co/150x150/E91E63/fff?text=A', bio: 'Cafe & Travel lover ☕️' },
  { id: 'u2', name: 'Bob', avatar: 'https://placehold.co/150x150/3F51B5/fff?text=B', bio: 'Sketching everyday 🎨' },
  { id: 'u3', name: 'Charlie', avatar: 'https://placehold.co/150x150/4CAF50/fff?text=C', bio: 'Life logger 📷' },
];

const MOCK_PAGES: Page[] = [
  {
    id: 'p1', owner: 'u1', type: 'diary', date: '2024-02-10', title: 'Nice Cafe',
    sceneData: { elements: [], appState: { viewBackgroundColor: '#fff' } }, assets: {},
    preview: { kind: 'remote', key: 'https://placehold.co/400x300/E91E63/fff?text=Cafe', mime: 'image/png' },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2', owner: 'u2', type: 'diary', date: '2024-02-11', title: 'Sketch #10',
    sceneData: { elements: [], appState: { viewBackgroundColor: '#fff' } }, assets: {},
    preview: { kind: 'remote', key: 'https://placehold.co/400x300/3F51B5/fff?text=Sketch', mime: 'image/png' },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: 'n1', owner: 'u1', title: "Alice's Cafe Log", description: 'Best coffee shops in Tokyo',
    cover: { kind: 'local', key: 'cover-red', mime: 'image/png' },
    pageIds: ['p1'], visibility: 'public',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'n2', owner: 'u2', title: "Daily Sketches", description: 'My practice',
    cover: { kind: 'local', key: 'cover-blue', mime: 'image/png' },
    pageIds: ['p2'], visibility: 'public',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'n3', owner: 'u1', title: "Travel 2024", description: 'Kyoto & Osaka',
    cover: { kind: 'local', key: 'cover-green', mime: 'image/png' },
    pageIds: [], visibility: 'friends',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// --- Components ---

const FriendsTimeline = ({ 
  onSelectUser, 
  onOpenNotebook 
}: { 
  onSelectUser: (u: User) => void; 
  onOpenNotebook: (n: Notebook) => void; 
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-10">
      
      {/* Active Users (Stories style) */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-5 min-w-max">
          {MOCK_USERS.map(user => (
            <button key={user.id} onClick={() => onSelectUser(user)} className="flex flex-col items-center gap-2 group">
              <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="relative w-full h-full rounded-full border-2 border-white overflow-hidden">
                   <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-600">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Recently Updated</h2>
        <div className="grid gap-6">
          {MOCK_NOTEBOOKS.map(nb => {
            const author = MOCK_USERS.find(u => u.id === nb.owner);
            if (!author) return null;
            return (
              <div key={nb.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpenNotebook(nb)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{author.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} /> <span>2h ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  {/* Notebook Cover (Reuse NotebookCard logic internally or use component) */}
                  <div className="shrink-0 scale-90 origin-top-left -mr-4 -mb-4">
                     {/* NotebookCard は any 型でキャストして利用 (型互換のため) */}
                     <NotebookCard notebook={nb as any} onClick={() => onOpenNotebook(nb)} />
                  </div>
                  
                  <div className="flex-1 py-1">
                    <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">{nb.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{nb.description}</p>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <span className="flex items-center gap-1"><Book size={12} /> {nb.pageIds.length} Pages</span>
                       <span className="flex items-center gap-1 text-pink-400"><Heart size={12} /> 12</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FriendShelf = ({ 
  user, 
  onClose, 
  onOpenNotebook 
}: { 
  user: User; 
  onClose: () => void; 
  onOpenNotebook: (n: Notebook) => void; 
}) => {
  const notebooks = MOCK_NOTEBOOKS.filter(nb => nb.owner === user.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#F9F8F6] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
            <Image src={user.avatar} alt={user.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{user.name}'s Desk</h2>
            <p className="text-xs text-gray-500">{user.bio}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Shelf */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
            {notebooks.length > 0 ? (
              notebooks.map(nb => (
                <div key={nb.id} className="flex flex-col items-center">
                  <NotebookCard notebook={nb as any} onClick={() => onOpenNotebook(nb)} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400">
                <p>No public notebooks yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Feature ---

export const FriendsFeature = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [readingNotebook, setReadingNotebook] = useState<Notebook | null>(null);

  // ページデータの解決 (本来はAPI fetch)
  const getPagesForNotebook = (notebook: Notebook) => {
    return notebook.pageIds
      .map(id => MOCK_PAGES.find(p => p.id === id))
      .filter((p): p is Page => !!p);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F9F8F6]/90 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <h1 className="font-serif font-bold text-2xl text-gray-800 tracking-tight">Friends</h1>
      </div>

      {/* Main Feed */}
      <FriendsTimeline 
        onSelectUser={setSelectedUser}
        onOpenNotebook={setReadingNotebook}
      />

      {/* User Shelf Overlay */}
      {selectedUser && (
        <FriendShelf 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onOpenNotebook={setReadingNotebook}
        />
      )}
      
      {/* Book Reader Overlay (Read-only) */}
      {readingNotebook && (
        <BookReader
          // 型の互換性のためキャスト (実際のアプリでは型を統一する)
          notebook={readingNotebook as any}
          initialPages={getPagesForNotebook(readingNotebook) as any}
          onClose={() => setReadingNotebook(null)}
          onUpdatePage={() => {}} // 読み取り専用
          onCreatePage={() => {}} // 読み取り専用
          onDeletePage={() => {}} // 読み取り専用
        />
      )}
    </div>
  );
};