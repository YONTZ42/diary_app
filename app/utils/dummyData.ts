import { Page, AssetRef } from "../types/schema";

// 日付操作ヘルパー: 今日からn日前
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// プレビュー画像URL生成ヘルパー
export const getPreviewUrl = (text: string, bgColor: string) => 
  `https://placehold.co/400x500/${bgColor}/ffffff/png?text=${encodeURIComponent(text)}`;

/**
 * ページデータのマスター定義
 * IDを固定値 ('page-01', 'page-02'...) にすることで、Notebook側からの参照を確実にします。
 */
export const MOCK_PAGES: Page[] = [
  // --- Notebook: カフェ巡り用 (page-01 ~ 03) ---
  {
    id: 'page-01',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(0), // 今日
    title: 'Blue Bottle Coffee',
    note: '駅前に新しくできた店舗に行ってみた。\n内装がすごくモダンで落ち着く。\nラテアートも綺麗だった。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-coffee', 'sticker-cake'],
    preview: { kind: 'remote', key: getPreviewUrl('Cafe\nLog 1', '8D6E63'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-02',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(2),
    title: 'Starbucks Reserve',
    note: '限定の豆を試飲。\n香りが全然違う！\n店員さんが親切に教えてくれた。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-coffee'],
    preview: { kind: 'remote', key: getPreviewUrl('Cafe\nLog 2', 'A1887F'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-03',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(5),
    title: 'Retro Kissaten',
    note: '昔ながらの喫茶店でプリンアラモード。\n硬めのプリンが最高に美味しい。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-pudding'],
    preview: { kind: 'remote', key: getPreviewUrl('Retro\nCafe', '5D4037'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },

  // --- Notebook: 旅行日記用 (page-04 ~ 06) ---
  {
    id: 'page-04',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(10),
    title: '京都旅行 1日目',
    note: '新幹線で京都へ。\nまずは清水寺に行った。\n天気が良くて景色が最高！',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-kyoto', 'sticker-temple'],
    preview: { kind: 'remote', key: getPreviewUrl('Kyoto\nDay 1', 'FF7043'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-05',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(9),
    title: '京都旅行 2日目',
    note: '嵐山で食べ歩き。\n竹林の小径は人が多かったけど幻想的だった。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-bamboo'],
    preview: { kind: 'remote', key: getPreviewUrl('Kyoto\nDay 2', '66BB6A'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-06',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(8),
    title: 'お土産まとめ',
    note: '八ッ橋と抹茶スイーツをたくさん買った。\n家族にも好評でよかった。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: ['sticker-gift'],
    preview: { kind: 'remote', key: getPreviewUrl('Kyoto\nSouvenir', 'FFA726'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },

  // --- Notebook: 未分類・その他 (page-07 ~ 09) ---
  {
    id: 'page-07',
    schemaVersion: 1,
    type: 'schedule',
    date: daysAgo(1),
    title: 'Weekly Plan',
    note: '今週の予定整理。\n水曜日はMTG。\n金曜日は飲み会。',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'remote', key: getPreviewUrl('Weekly\nPlan', '42A5F5'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-08',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(3),
    title: 'Shopping List',
    note: '・洗剤\n・牛乳\n・卵\n・新しいノート',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'remote', key: getPreviewUrl('Shopping', 'EC407A'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
  {
    id: 'page-09',
    schemaVersion: 1,
    type: 'diary',
    date: daysAgo(4),
    title: 'Idea Memo',
    note: '新しいアプリのアイデア。\n写真から自動でカラーパレットを作る機能とか？',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: {},
    usedStickerIds: [],
    preview: { kind: 'remote', key: getPreviewUrl('Idea\nSketch', '7E57C2'), mime: 'image/png' },
    sceneData: { elements: [], appState: { viewBackgroundColor: "#ffffff00" } }
  },
];

// 互換性のために関数としてもエクスポート
export const generateMockPages = (): Page[] => MOCK_PAGES;