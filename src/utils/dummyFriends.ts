import { Notebook, Page } from '@/types/schema';
import { MOCK_PAGES } from '@/utils/dummyDiary'; // 既存のダミーページを流用

// 画像URLヘルパー
const getImg = (text: string, bg: string) => `https://placehold.co/150x150/${bg}/ffffff/png?text=${text}`;

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice', avatar: getImg('A', 'E91E63'), bio: 'Cafe & Travel lover ☕️' },
  { id: 'u2', name: 'Bob', avatar: getImg('B', '3F51B5'), bio: 'Sketching everyday 🎨' },
  { id: 'u3', name: 'Charlie', avatar: getImg('C', '4CAF50'), bio: 'Life logger 📷' },
];

// 友達の公開ノートブック
export const MOCK_FRIEND_NOTEBOOKS: (Notebook & { authorId: string })[] = [
  {
    id: 'f-nb-1',
    authorId: 'u1',
    title: 'Alice\'s Cafe Log',
    description: 'Best coffee shops in Tokyo',
    pageIds: ['page-1'], // dummyDiaryのデータを流用
    schemaVersion: 1, createdAt: '', updatedAt: '',
    cover: { kind: 'local', key: 'cover-red', mime: 'image/png' },
  },
  {
    id: 'f-nb-2',
    authorId: 'u2',
    title: 'Daily Sketches 2024',
    description: 'My daily practice.',
    pageIds: ['page-2', 'page-3'],
    schemaVersion: 1, createdAt: '', updatedAt: '',
    cover: { kind: 'local', key: 'cover-blue', mime: 'image/png' },
  },
  {
    id: 'f-nb-3',
    authorId: 'u1',
    title: 'Kyoto Trip',
    description: 'Autumn leaves were beautiful.',
    pageIds: ['page-1', 'page-3'],
    schemaVersion: 1, createdAt: '', updatedAt: '',
    cover: { kind: 'local', key: 'cover-green', mime: 'image/png' },
  },
];