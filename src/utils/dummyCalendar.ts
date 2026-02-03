import { Page } from '@/types/schema';

// 画像URL生成ヘルパー
const getImg = (text: string, color: string) => 
  `https://placehold.co/400x400/${color}/ffffff/png?text=${text}`;

// 今月の日記データを作成
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed

export const MOCK_CALENDAR_PAGES: Page[] = [
  {
    id: 'cal-1',
    type: 'diary',
    date: new Date(year, month, 3).toISOString().split('T')[0], // 3日
    title: 'カフェ記録',
    // プレビュー画像として、そのページで使った写真やステッカーのURLを持たせる
    preview: { kind: 'remote', key: getImg('Coffee', '8D6E63'), mime: 'image/png' },
    usedStickerIds: ['sticker-1'],
    sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
  {
    id: 'cal-2',
    type: 'diary',
    date: new Date(year, month, 5).toISOString().split('T')[0], // 5日
    title: '映画',
    preview: { kind: 'remote', key: getImg('Cinema', '212121'), mime: 'image/png' },
    usedStickerIds: [],
    sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
  
  {
    id: 'cal-3-1', // 12日 1枚目
    type: 'diary',
    date: new Date(year, month, 12).toISOString().split('T')[0],
    title: '旅行 到着',
    preview: { kind: 'remote', key: getImg('Travel 1', '0288D1'), mime: 'image/png' },
    usedStickerIds: [], sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
  {
    id: 'cal-3-2', // 12日 2枚目
    type: 'diary',
    date: new Date(year, month, 12).toISOString().split('T')[0],
    title: 'ホテルで夕食',
    preview: { kind: 'remote', key: getImg('Dinner', 'F57C00'), mime: 'image/png' },
    usedStickerIds: [], sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },

  {
    id: 'cal-4',
    type: 'diary',
    date: new Date(year, month, 13).toISOString().split('T')[0], // 13日
    title: '旅行2日目',
    preview: { kind: 'remote', key: getImg('Hotel', '0097A7'), mime: 'image/png' },
    usedStickerIds: [],
    sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
  {
    id: 'cal-5',
    type: 'diary',
    date: new Date(year, month, 20).toISOString().split('T')[0], // 20日
    title: '猫カフェ',
    preview: { kind: 'remote', key: getImg('Cat', 'F48FB1'), mime: 'image/png' },
    usedStickerIds: [],
    sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
  {
    id: 'cal-6',
    type: 'diary',
    date: new Date(year, month, 25).toISOString().split('T')[0], // 25日
    title: '読書',
    // 画像がない場合は preview が null または空文字の想定
    preview: { kind: 'local', key: '', mime: '' }, 
    note: '今日は文字だけの日記。',
    usedStickerIds: [],
    sceneData: {}, assets: {}, schemaVersion: 1, createdAt: '', updatedAt: '',
  },
];