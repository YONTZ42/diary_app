import { Page } from '@/types/schema';

// 画像生成ヘルパー
const getImg = (text: string, color: string) => 
  `https://placehold.co/400x400/${color}/ffffff/png?text=${text}`;

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed (0=1月)

export const MOCK_CALENDAR_PAGES: Page[] = [
  {
    id: 'cal-1',
    type: 'diary',
    // 3日
    date: new Date(year, month, 3).toISOString().split('T')[0],
    title: 'Cafe Time',
    note: 'Delicious latte at the corner cafe.',
    preview: { kind: 'remote', key: getImg('Cafe', '8D6E63'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: '#fff' } },
    assets: {}, usedStickerIds: [],
    schemaVersion: 1, createdAt: '', updatedAt: '', owner: 'u1'
  },
  {
    id: 'cal-2',
    type: 'diary',
    // 12日 (複数ある日の1つ目)
    date: new Date(year, month, 12).toISOString().split('T')[0],
    title: 'Kyoto Trip Day 1',
    preview: { kind: 'remote', key: getImg('Travel', '0288D1'), mime: 'image/png' },
    sceneData: {}, assets: {}, usedStickerIds: [],
    schemaVersion: 1, createdAt: '', updatedAt: '', owner: 'u1'
  },
  {
    id: 'cal-3',
    type: 'diary',
    // 12日 (2つ目)
    date: new Date(year, month, 15).toISOString().split('T')[0],
    title: 'Dinner',
    preview: { kind: 'remote', key: getImg('Dinner', 'F57C00'), mime: 'image/png' },
    sceneData: {}, assets: {}, usedStickerIds: [],
    schemaVersion: 1, createdAt: '', updatedAt: '', owner: 'u1'
  },
  {
    id: 'cal-4',
    type: 'diary',
    // 20日
    date: new Date(year, month, 20).toISOString().split('T')[0],
    title: 'Cat Cafe',
    preview: { kind: 'remote', key: getImg('Cat', 'F48FB1'), mime: 'image/png' },
    sceneData: {}, assets: {}, usedStickerIds: [],
    schemaVersion: 1, createdAt: '', updatedAt: '', owner: 'u1'
  },
  {
    id: 'cal-5',
    type: 'diary',
    // 25日 (画像なし、テキストのみ)
    date: new Date(year, month, 25).toISOString().split('T')[0],
    title: 'Reading',
    note: 'Finished a great book today.',
    preview: { kind: 'local', key: '', mime: '' }, // 画像なし
    sceneData: {}, assets: {}, usedStickerIds: [],
    schemaVersion: 1, createdAt: '', updatedAt: '', owner: 'u1'
  },
];