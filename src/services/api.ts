import { getSession } from "next-auth/react";
import { Notebook, Page, Sticker,Schedule } from '@/types/schema';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.memocho.link/api';
console.log("API_BASE_URL:", API_BASE_URL);

// スネークケースのキーを削除するヘルパー
// (簡易的に scene_data, used_sticker_ids などを除外)
const sanitizePageData = (data: Partial<Page>): Record<string, any> => {
  const sanitized: Record<string, any> = { ...data };
  
  // 混入している可能性のあるスネークケースキーを削除
  delete sanitized['scene_data'];
  delete sanitized['used_sticker_ids'];
  delete sanitized['layout_mode'];
  delete sanitized['layout_settings'];
  // 他にあれば追加

  return sanitized;
};



interface FetchOptions extends RequestInit {
  skipAuth?: boolean; // 追加
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;

console.log("Session Token:", token);
// --- 調査用のログ（サーバーで実行された時にnpmコンソールに出る） ---
  if (typeof window === "undefined") {
    console.log(`[Server Fetch] Endpoint: ${endpoint}`);
    console.log(`[Server Fetch] Token exists: ${!!token}`);
    if (!token) console.warn("⚠️ Warning: No Access Token found in session!");
  }
  // ---------------------------------------------------------

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (!options.skipAuth) { // スキップ指示がなければトークン付与
    const session = await getSession();
    const token = session?.accessToken;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }


  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials:'omit',
    cache:'no-store',

  });

  if (response.status === 401) {
    // 認証エラー処理 (必要に応じて)
    throw new Error('Unauthorized');
  }

  if (response.status === 204) {
    return null as T;
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  
  // ★重要: ここで変換をかける
  return data;

}

// --- Notebooks ---

export const fetchNotebooks = async (): Promise<Notebook[]> => {
  return fetchAPI<Notebook[]>('/notebooks/');
};

export const createNotebook = async (data: Partial<Notebook>): Promise<Notebook> => {
  return fetchAPI<Notebook>('/notebooks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// --- Pages ---

// ページ一覧を取得（本来はNotebook IDなどでフィルタリングすべきだが、一旦全件取得または自分のページ一覧）
export const fetchPages = async (): Promise<Page[]> => {
  return fetchAPI<Page[]>('/pages/');
};

interface FetchPagesParams {
  year?: number;
  month?: number;
  day?: number;
}
export const fetchPagesByDate = async (params: FetchPagesParams): Promise<Page[]> => {
  // クエリパラメータの構築
  const query = new URLSearchParams();
  if (params.year) query.append('year', params.year.toString());
  if (params.month) query.append('month', params.month.toString());
  if (params.day) query.append('day', params.day.toString());
  query.append('pageType', 'diary');
  return fetchAPI<Page[]>(`/pages/?${query.toString()}`);
};

export const updatePage = async (id: string, data: Partial<Page>): Promise<Page> => {
  // 送信前に不要なキーをお掃除
  const body = data;
  console.log("Sending body to API:", body); // ★これを確認

  return fetchAPI<Page>(`/pages/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

export const deletePage = async (id: string): Promise<void> => {
  return fetchAPI<void>(`/pages/${id}/`, {
    method: 'DELETE',
  });
};


/**
 * 指定したNotebookに含まれるPage一覧を取得する
 * @param notebookId ノートブックのUUID
 */
export const fetchPagesInNotebook = async (notebookId: string): Promise<Page[]> => {
  return fetchAPI<Page[]>(`/notebooks/${notebookId}/pages/`);
};


export const createPage = async (data: Partial<Page>, notebookId?: string): Promise<Page> => {
  const body = { 
    ...data, 
    notebook_id: notebookId 
  };
  return fetchAPI<Page>('/pages/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};


// --- Fetch Schedule ---
interface FetchScheduleParams {
  type: 'monthly' | 'weekly';
  startDate: string; // "YYYY-MM-DD"
}

// 条件に合うスケジュールを1件取得（なければnull）
export const fetchSchedule = async (params: FetchScheduleParams): Promise<Schedule | null> => {
  const query = new URLSearchParams({
    type: params.type,
    start_date: params.startDate
  });
  
  const results = await fetchAPI<Schedule[]>(`/schedules/?${query.toString()}`);
  return results.length > 0 ? results[0] : null;
};

export const createSchedule = async (data: Partial<Schedule>): Promise<Schedule> => {
  return fetchAPI<Schedule>('/schedules/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSchedule = async (id: string, data: Partial<Schedule>): Promise<Schedule> => {
  // 必要に応じてサニタイズ（scene_data除去など）を入れる
  return fetchAPI<Schedule>(`/schedules/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};



// --- Uploads (S3 Presigned) ---

interface UploadIssueResponse {
  uploadUrl: string;
  s3Key: string;
  uploadSessionId: string;
}

// 1. Presigned URLの発行
export const issueUpload = async (filename: string, mimeType: string, purpose: string): Promise<UploadIssueResponse> => {
  return fetchAPI<UploadIssueResponse>('/uploads/issue/', {
    method: 'POST',
    body: JSON.stringify({
      filename: filename,
      mime_type: mimeType,  // mimeType から mime_type に変更
      purpose: purpose
     }),
  });
};

// 2. S3への直接アップロード (※これはDjangoを経由しない)
export const uploadToS3 = async (uploadUrl: string, file: Blob, mimeType: string) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': mimeType,
    },
  });
  if (!response.ok) {
    throw new Error('S3 Upload Failed');
  }
};

// 3. アップロード完了確認
export const confirmUpload = async (uploadSessionId: string) => {
  return fetchAPI('/uploads/confirm/', {
    method: 'POST',
    body: JSON.stringify({ 
      upload_session_id: uploadSessionId // ここをスネークケースに変更
     }),
  });
};

// --- Stickers ---

export const fetchStickers = async (): Promise<Sticker[]> => {
  return fetchAPI<Sticker[]>('/stickers/');
};

// Stickerの作成 (S3キーを使って登録)
export const createSticker = async (s3Key: string, width: number, height: number): Promise<Sticker> => {
  // AssetRef構造を作成
  const pngAsset = {
    kind: 'remote',
    key: s3Key,
    width,
    height,
  };

  const body = {
    png: pngAsset,
    width,
    height,
    // 他の初期値
    name: 'New Sticker',
    tags: [],
    style: { outline: { enabled: false, size: 0 }, shadow: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, opacity: 0 } }
  };

  return fetchAPI<Sticker>('/stickers/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

interface RegisterParams {
  email: string;
  password: string;
  displayName?: string;
}

export const registerUser = async (params: RegisterParams) => {
  return fetchAPI('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(params),
    skipAuth: true, // トークン不要
  });
};

