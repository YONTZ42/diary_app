import React from 'react';
import { User, MOCK_FRIEND_NOTEBOOKS } from '@/utils/dummyFriends';
import { NotebookCard } from '@/components/diary/NotebookCard';
import { X, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { Notebook } from '@/types/schema';

interface FriendShelfProps {
  user: User;
  onClose: () => void;
  onOpenNotebook: (notebook: Notebook) => void;
}

export const FriendShelf: React.FC<FriendShelfProps> = ({ user, onClose, onOpenNotebook }) => {
  // そのユーザーのノートブックをフィルタリング
  const notebooks = MOCK_FRIEND_NOTEBOOKS.filter(nb => nb.authorId === user.id);

  return (
    <div className="fixed inset-0 z-40 bg-[#F9F8F6] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
            <Image src={user.avatar} alt={user.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {user.name}'s Desk
            </h2>
            <p className="text-xs text-gray-500">{user.bio}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
          <X size={24} />
        </button>
      </div>

      {/* Main Shelf Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-fixed">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 bg-white/80 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
            Public Notebooks
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {notebooks.length > 0 ? (
              notebooks.map(nb => (
                <NotebookCard
                  key={nb.id}
                  notebook={nb}
                  onClick={() => onOpenNotebook(nb)}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <p>No public notebooks yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};