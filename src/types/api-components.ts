// types/api.ts (新しく作る)
import { components } from "./api-types";

// よく使うスキーマを抽出
export type User = components["schemas"]["User"];
export type Notebook = components["schemas"]["Notebook"];
export type Page = components["schemas"]["Page"];
export type Sticker = components["schemas"]["Sticker"];
export type Schedule = components["schemas"]["Schedule"];

// APIのレスポンス型などを抽出する場合
export type UserRegistrationRequest = components["schemas"]["UserRegistration"];