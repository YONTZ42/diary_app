/**
 * 共通プリミティブ型定義
 * IDはUUID v4、日付はISO8601文字列を想定
 */
export type UUID = string;
export type ISO8601 = string; // "2024-01-30T15:00:00Z"
export type YYYYMMDD = string; // "2024-01-30"


// types/api.ts (新しく作る)
import { components } from "./api-types";

// よく使うスキーマを抽出
export type AssetRef = components["schemas"]["AssetRef"];
export type ExcalidrawSceneData = components["schemas"]["ExcalidrawSceneData"];
export type User = components["schemas"]["User"];
export type Notebook = components["schemas"]["Notebook"];
export type Page = components["schemas"]["Page"];
export type Sticker = components["schemas"]["Sticker"];
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
export type Schedule = components["schemas"]["Schedule"];
export type ScheduleType = components["schemas"]["ScheduleTypeEnum"];
// APIのレスポンス型などを抽出する場合
export type UserRegistrationRequest = components["schemas"]["UserRegistration"];


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