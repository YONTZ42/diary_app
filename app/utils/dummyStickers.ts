import { Sticker } from '../types/schema';

// ランダムなID生成
const uuid = () => Math.random().toString(36).substring(2, 9);

// ダミー画像URL生成 (サイズとテキスト指定)
const getDummyImageUrl = (text: string, color: string) => 
  `https://placehold.co/200x200/${color}/ffffff/png?text=${text}`;

export const generateMockStickers = (): Sticker[] => {
  return [
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Coffee Cup',
      tags: ['cafe', 'drink'],
      favorite: true,
      usageCount: 12,
      width: 200,
      height: 200,
      png: { kind: 'remote', key: getDummyImageUrl('Coffee', '8D6E63'), mime: 'image/png' },
      thumb: { kind: 'remote', key: getDummyImageUrl('Coffee', '8D6E63'), mime: 'image/png' },
      style: {
        outline: { enabled: true, size: 4, color: '#ffffff' },
        shadow: { enabled: true, blur: 4, offsetX: 2, offsetY: 2, opacity: 0.2 }
      }
    },
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Pancakes',
      tags: ['cafe', 'food', 'sweets'],
      favorite: false,
      usageCount: 5,
      width: 200,
      height: 200,
      png: { kind: 'remote', key: getDummyImageUrl('Pancakes', 'FFAB91'), mime: 'image/png' },
      style: {
        outline: { enabled: true, size: 0, color: '#ffffff' },
        shadow: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, opacity: 0 }
      }
    },
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Ticket Stub',
      tags: ['travel', 'memory'],
      favorite: true,
      usageCount: 20,
      width: 300,
      height: 150,
      png: { kind: 'remote', key: getDummyImageUrl('Ticket', '90CAF9'), mime: 'image/png' },
      style: {
        outline: { enabled: false, size: 0 },
        shadow: { enabled: true, blur: 8, offsetX: 4, offsetY: 4, opacity: 0.3 }
      }
    },
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Cat',
      tags: ['animal', 'cat'],
      favorite: false,
      usageCount: 2,
      width: 200,
      height: 200,
      png: { kind: 'remote', key: getDummyImageUrl('Cat', 'A5D6A7'), mime: 'image/png' },
      style: {
        outline: { enabled: true, size: 5, color: '#ffffff' },
        shadow: { enabled: true, blur: 2, offsetX: 1, offsetY: 1, opacity: 0.2 }
      }
    },
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Date Stamp',
      tags: ['deco', 'text'],
      favorite: true,
      usageCount: 45,
      width: 150,
      height: 150,
      png: { kind: 'remote', key: getDummyImageUrl('Date', 'CE93D8'), mime: 'image/png' },
      style: {
        outline: { enabled: false, size: 0 },
        shadow: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, opacity: 0 }
      }
    },
    {
      id: uuid(),
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      name: 'Flower',
      tags: ['nature', 'deco'],
      favorite: false,
      usageCount: 8,
      width: 200,
      height: 200,
      png: { kind: 'remote', key: getDummyImageUrl('Flower', 'EF9A9A'), mime: 'image/png' },
      style: {
        outline: { enabled: true, size: 2, color: '#ffffff' },
        shadow: { enabled: true, blur: 5, offsetX: 2, offsetY: 2, opacity: 0.1 }
      }
    },
  ];
};