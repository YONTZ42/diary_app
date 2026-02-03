import React from 'react';
import { MOCK_USERS, MOCK_FRIEND_NOTEBOOKS } from '@/utils/dummyFriends';
import { NotebookCard } from '@/components/diary/NotebookCard';
import { Notebook } from '@/types/schema';
import Image from 'next/image';

interface FriendsTimelineProps {
  onSelectUser: (userId: string) => void;
  onOpenNotebook: (notebook: Notebook) => void;
}

export const FriendsTimeline: React.FC<FriendsTimelineProps> = ({ onSelectUser, onOpenNotebook }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      
      {/* Horizontal User List (Active Friends) */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-6 min-w-max">
          {MOCK_USERS.map(user => (
            <button 
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative w-16 h-16 rounded-full p-1 border-2 border-transparent group-hover:border-blue-400 transition-all">
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-md">
                   <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed (Updated Notebooks) */}
      <div>
        <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>Recently Updated</span>
          <div className="h-px flex-1 bg-gray-200 ml-4" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_FRIEND_NOTEBOOKS.map(nb => {
            const author = MOCK_USERS.find(u => u.id === nb.authorId);
            if (!author) return null;

            return (
              <div key={nb.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-md transition-shadow">
                {/* Left: Notebook Cover */}
                <div className="shrink-0 scale-90 origin-top-left">
                  <NotebookCard notebook={nb} onClick={() => onOpenNotebook(nb)} />
                </div>

                {/* Right: Info */}
                <div className="flex-1 py-2">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="relative w-6 h-6 rounded-full overflow-hidden">
                       <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                     </div>
                     <span className="text-sm font-bold text-gray-700">{author.name}</span>
                     <span className="text-xs text-gray-400">• 2h ago</span>
                   </div>
                   
                   <h3 
                     className="font-serif font-bold text-lg text-gray-900 mb-1 cursor-pointer hover:underline decoration-blue-400/50"
                     onClick={() => onOpenNotebook(nb)}
                   >
                     {nb.title}
                   </h3>
                   <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                     {nb.description}
                   </p>

                   <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                      <span>♥ 12 Likes</span>
                      <span>📖 {nb.pageIds.length} Pages</span>
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