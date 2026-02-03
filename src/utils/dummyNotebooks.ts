import { Notebook } from "@/types/schema";

// 表紙画像URL生成ヘルパー
const getCoverUrl = (text: string, bgColor: string) => 
  `https://placehold.co/300x400/${bgColor}/ffffff/png?text=${encodeURIComponent(text)}`;

/**
 * ノートブックデータのマスター定義
 * pageIds には MOCK_PAGES で定義した固定IDを指定します。
 */
export const MOCK_NOTEBOOKS: Notebook[] = [
  // --- ジャンル: Favorites ---
  {
    id: 'notebook-cafe',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'カフェ巡り 2024',
    description: '週末に行った素敵なカフェの記録まとめ',
    tags: ['Cafe', 'LifeLog'],
    // page-01, 02, 03 を収録
    pageIds: ['page-01', 'page-02', 'page-03'],
    cover: { kind: 'remote', key: getCoverUrl('Cafe\nCollection', '6D4C41'), mime: 'image/png' }
  },
  {
    id: 'notebook-travel',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: '京都旅行記',
    description: '2泊3日の京都旅行。紅葉が綺麗だった。',
    tags: ['Travel', 'Memory', 'Kyoto'],
    // page-04, 05, 06 を収録
    pageIds: ['page-04', 'page-05', 'page-06'],
    cover: { kind: 'remote', key: getCoverUrl('Kyoto\nTrip', 'FF5722'), mime: 'image/png' }
  },

  // --- ジャンル: Work & Study ---
  {
    id: 'notebook-ideas',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'アプリ開発アイデア',
    description: '思いついた機能やUIのスケッチ',
    tags: ['Work', 'Idea', 'Dev'],
    // page-09 を収録
    pageIds: ['page-09'],
    cover: { kind: 'remote', key: getCoverUrl('Dev\nIdeas', '3F51B5'), mime: 'image/png' }
  },
  {
    id: 'notebook-schedule',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Weekly Schedules',
    description: '週間予定のアーカイブ',
    tags: ['Work', 'Schedule'],
    // page-07 を収録
    pageIds: ['page-07'],
    cover: { kind: 'remote', key: getCoverUrl('Weekly\nLog', '009688'), mime: 'image/png' }
  },

  // --- ジャンル: Others ---
  {
    id: 'notebook-daily',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: '雑記・メモ',
    description: '買い物リストやToDoなど',
    tags: ['Daily', 'Memo'],
    // page-08 を収録
    pageIds: ['page-08'],
    cover: { kind: 'remote', key: getCoverUrl('Daily\nNotes', '607D8B'), mime: 'image/png' }
  },
  {
    id: 'notebook-empty',
    schemaVersion: 1,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: '新しいノート',
    description: 'まだページがありません',
    tags: ['New'],
    // 空のノート
    pageIds: [],
    cover: { kind: 'remote', key: getCoverUrl('New\nNotebook', 'E0E0E0'), mime: 'image/png' }
  }
];

// 互換性のために関数としてもエクスポート
export const generateMockNotebooks = (): Notebook[] => MOCK_NOTEBOOKS;