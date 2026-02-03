import { Page, Notebook } from '@/types/schema';

// UUID生成
const uuid = () => Math.random().toString(36).substring(2, 9);

// デフォルトのシーンデータ
const DEFAULT_SCENE = {
  elements: [],
  appState: {
    viewBackgroundColor: "#fafafa",
    currentItemFontFamily: 1,
  }
};

// 日記ページデータのモック
export const MOCK_PAGES: Page[] = [
  {
    id: 'page-1',
    type: 'diary',
    date: '2024-02-01',
    title: 'カフェで読書',
    note: '今日は久しぶりに駅前のカフェへ。新作のラテが美味しかった。',
    tags: ['cafe'],
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sceneData: DEFAULT_SCENE, // ★修正: 空オブジェクトではなく正しい構造を入れる
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'local', key: '', mime: 'image/png' },
  },
  {
    id: 'page-2',
    type: 'diary',
    date: '2024-02-02',
    title: '映画鑑賞',
    note: '気になっていた映画を見た。映像美が素晴らしくて、インスピレーションを受けた。',
    tags: ['movie', 'art'],
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sceneData: DEFAULT_SCENE,
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'local', key: '', mime: 'image/png' },
  },
  {
    id: 'page-3',
    type: 'diary',
    date: '2024-02-03',
    title: '散歩日和',
    note: '暖かかったので公園まで散歩。猫を見かけた。',
    tags: ['walk', 'cat'],
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sceneData: DEFAULT_SCENE,
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'local', key: '', mime: 'image/png' },
  },
];

// ノートブック（棚）のモック
export const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-1',
    title: '2024 Daily Life',
    description: '日々の記録',
    pageIds: ['page-1', 'page-2', 'page-3'],
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cover: { kind: 'local', key: 'cover-blue', mime: 'image/png' },
  },
  {
    id: 'nb-2',
    title: 'Travel Log',
    description: '旅行の思い出',
    pageIds: [],
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cover: { kind: 'local', key: 'cover-orange', mime: 'image/png' },
  },
];