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



// types/api.ts (新しく作る)
import { components } from "./from_backend/api-types";

// よく使うスキーマを抽出
export type User = components["schemas"]["User"];
export type Notebook = components["schemas"]["Notebook"];
export type Page = components["schemas"]["Page"];
export type Sticker = components["schemas"]["Sticker"];
export type Schedule = components["schemas"]["Schedule"];
export type ScheduleType = components["schemas"]["ScheduleTypeEnum"];
// APIのレスポンス型などを抽出する場合
export type UserRegistrationRequest = components["schemas"]["UserRegistration"];



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