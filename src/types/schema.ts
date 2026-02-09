/**
 * 共通プリミティブ型定義
 * IDはUUID v4、日付はISO8601文字列を想定
 */
export type UUID = string;
export type ISO8601 = string; // "2024-01-30T15:00:00Z"
export type YYYYMMDD = string; // "2024-01-30"

/**
 * 全エンティティ共通のメタデータ
 * Djangoモデルの共通フィールドとマッピングしやすい設計
 */
export interface EntityBase {
  id: UUID;
  schemaVersion: number; // データ構造のマイグレーション用
  createdAt: ISO8601;
  updatedAt: ISO8601;
  deletedAt?: ISO8601 | null; // 論理削除用
  userId?: string; // 将来のクラウド同期用
}

// ------------------------------------------------------------------
// 1. Asset Strategy (画像の参照管理)
// ローカル(IndexedDB/FileAPI)とリモート(S3/CloudFront)を透過的に扱う
// ------------------------------------------------------------------

export type AssetKind = 'local' | 'remote';

/**
 * 軽量版AssetRef (サムネイル等での利用を想定)
 */
export interface AssetRefLite {
  kind: AssetKind;
  key: string; // localならblobURI/uuid, remoteならS3 key/URL
  mime: string;
  width?: number;
  height?: number;
  sha256?: string; // ハッシュ値（重複排除・変更検知用）
}

/**
 * 完全版AssetRef
 * オリジナル画像に加え、用途別のサイズ違い(variants)を持つ
 */
export interface AssetRef extends AssetRefLite {
  size?: number; // bytes
  filename?: string; // ダウンロード時のファイル名保存用
  // レンダリング最適化用のバリエーション
  variants?: {
    thumb?: AssetRefLite; // 一覧表示用 (例: 300px)
    medium?: AssetRefLite; // 編集キャンバス用 (例: 1024px)
  };

  // 生成元の情報（再編集やリソース管理用）
  source?: {
    type: 'upload' | 'sticker' | 'generated';
    originId?: UUID; // 元になったSticker.idやPage.id
  };
}

// ------------------------------------------------------------------
// 2. Sticker (切り抜き素材)
// 「資産化」の核となるデータ
// ------------------------------------------------------------------

export interface StickerStyle {
  outline: {
    enabled: boolean;
    size: number; // px
    color?: string; // hex
    opacity?: number; // 0-1
  };
  shadow: {
    enabled: boolean;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
    color?: string;
  };
}

export interface Sticker extends EntityBase {
  // メタデータ
  name?: string; // ユーザーが付けた名前（検索用）
  tags: string[]; // "food", "travel", "cat"
  favorite: boolean;
  lastUsedAt?: ISO8601; // "最近使った" ソート用
  usageCount: number; // "人気" ソート用
  isSystem?: boolean; // プリインストール素材かどうか

  // 画像データ
  png: AssetRef; // 切り抜かれた背景透過PNG（実体）
  imageUrl?: string; // フルURL（remoteの場合のみ。localでは不要）

  // UI表示用キャッシュ（一覧での高速化）
  thumb?: AssetRefLite; 
  
  // 寸法（キャンバス配置時の基準サイズ）
  width: number;
  height: number;

  // 編集情報（再編集・非破壊編集用）
  style: StickerStyle;

  // 切り抜き元の情報（将来的に「切り抜き直す」機能を作る場合に必要）
  cropSource?: {
    originalImage: AssetRefLite; // 元の写真
    maskPath?: string; // SVG path or mask points
    bbox?: { x: number; y: number; w: number; h: number };
  };
}

// ------------------------------------------------------------------
// 3. Page (作成した手帳ページ)
// Diary, Calendar, Scheduleすべてを統括する実体
// ------------------------------------------------------------------

/**
 * ページの種類
 * diary: 日付に紐づく日記 (デフォルト)
 * schedule: 週/月の予定キャンバス
 * free: 日付に縛られないメモ
 */
export type PageType = 'diary' | 'schedule' | 'free';

export interface Page extends EntityBase {
  // 基本属性
  type: PageType;
  date: YYYYMMDD; // カレンダー/日記の紐付けキー ("2024-01-30")
  title?: string; // "京都旅行 1日目"（一覧・検索用）
  note?: string; // 検索用のプレーンテキストメモ（OCR結果など）
  tags?: string[]; // ページ単位のタグ付け

  // キャンバスデータ (Excalidraw等のシーンデータそのもの)
  // JSON.stringifyして保存、またはJSON型として扱う
  sceneData: any; 

  // キャンバス内で使用している画像ファイルへの参照マップ
  // keyはキャンバスライブラリが生成するfileId
  assets: Record<string, AssetRef>;

  // ページ内で使用されたステッカーID一覧（「この素材を使ったページ」検索用）
  usedStickerIds: UUID[];

  // 閲覧・サムネイル用キャッシュ（重要）
  // これがないとカレンダー表示時に全ページのSceneをレンダリングする必要が出る
  preview: AssetRef; 

  // 書き出し履歴（SNSシェア用などのキャッシュ）
  export?: {
    image?: AssetRef;
    pdf?: AssetRef;
    updatedAt: ISO8601; // 最終書き出し日時（scene更新と比較して古ければ再生成）
  };
}

export type ScheduleType = 'monthly' | 'weekly' | 'daily';
/**
 * ハーフシートで編集する予定リストのアイテム
 */
export interface ScheduleEvent {
  id: string; // uuid
  text: string;
  isCompleted: boolean;
  time?: string; // "14:00" など（任意）
  color?: string; // マーカー色など（任意）
}

/**
 * 日付ごとのイベントリスト
 * key: "YYYY-MM-DD"
 */
export type ScheduleEventsMap = Record<string, ScheduleEvent[]>;

export interface Schedule extends EntityBase {
  type: ScheduleType;
  startDate: YYYYMMDD; // "2024-02-01" (月なら1日、週なら日曜/月曜)
  title?: string;

  // Excalidraw (盤面)
  sceneData: any;
  assets: Record<string, AssetRef>;

  // テキストリストデータ (ハーフシート)
  // フロントエンドでは日付をキーにしてアクセスしやすくする
  eventsData: ScheduleEventsMap;

  // プレビュー
  preview?: AssetRef;
}


// ------------------------------------------------------------------
// 4. Notebook (ジャンル別アーカイブ)
// Pageを束ねる「プレイリスト」のような存在
// ------------------------------------------------------------------

export interface Notebook extends EntityBase {
  title: string; // "カフェ巡り", "2024年 育児記録"
  description?: string;
  
  // 表紙（ユーザー設定 or 先頭ページのサムネ or プリセット）
  cover?: AssetRef; 

  // 収録ページと並び順
  // 単なるID配列にすることで、ドラッグ&ドロップでの並べ替えを容易にする
  pageIds: UUID[]; 

  tags?: string[]; // ジャンル分け用
  
  // 表示設定（ユーザーが最後に開いたときの設定など）
  viewSettings?: {
    sortOrder: 'custom' | 'date_asc' | 'date_desc';
    displayMode: 'grid' | 'reader'; // 一覧か、本のようにめくるか
  };
}

// ------------------------------------------------------------------
// 5. UserSettings (アプリ設定・ローカル状態)
// ------------------------------------------------------------------

export interface UserSettings {
  userId: string;
  isPremium: boolean;
  
  // 最後に開いていた状態
  lastOpened: {
    view: 'pages' | 'sticker' | 'notebook';
    notebookId?: UUID;
    pageDate?: YYYYMMDD;
  };

  // デフォルト設定
  preferences: {
    defaultTemplateId?: string;
    saveToCameraRoll: boolean;
    highQualityExport: boolean;
  };
}