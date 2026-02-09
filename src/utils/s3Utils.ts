// src/utils/s3.ts (ファイルがない場合は作成)

const S3_BUCKET_URL = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN;

export const getS3Url = (key: string | undefined): string => {
  if (!key) return "";
  // すでにフルURL（http...）の場合はそのまま返す
  if (key.startsWith('http')) return key;
  // キーの先頭にスラッシュがあれば除去して結合
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  return `${S3_BUCKET_URL}/${cleanKey}`;
};