import { useState, useRef, useCallback } from 'react';
import { issueUpload, uploadToS3, confirmUpload } from '@/services/api';

// CloudFrontのドメイン (環境変数などで管理)
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'https://dxxxx.cloudfront.net';

export const useExcalidrawFiles = () => {
  // アップロード中のファイルIDリスト
  const [uploadingFileIds, setUploadingFileIds] = useState<Set<string>>(new Set());
  
  // アップロード済みファイルのキャッシュ (fileId -> remoteUrl)
  // これにより、同じファイルを再度アップロードするのを防ぐ
  const uploadedFilesRef = useRef<Map<string, string>>(new Map());
  const uploadingFileIdsRef = useRef<Set<string>>(new Set());

  const markUploading = (fileId: string, uploading: boolean) => {
    const next = new Set(uploadingFileIdsRef.current);
    if (uploading) next.add(fileId);
    else next.delete(fileId);
    uploadingFileIdsRef.current = next;
    setUploadingFileIds(next); // UI更新用
  };

  const handleFilesChange = useCallback(async (files: Record<string, any>) => {
    for (const [fileId, file] of Object.entries(files)) {
      if (uploadedFilesRef.current.has(fileId)) continue;
      if (uploadingFileIdsRef.current.has(fileId)) continue;

      if (file.dataURL && file.dataURL.startsWith("data:image")) {
        markUploading(fileId, true);

        uploadImage(fileId, file).then((remoteUrl) => {
          if (remoteUrl) uploadedFilesRef.current.set(fileId, remoteUrl);
        }).finally(() => {
          markUploading(fileId, false);
        });
      }
    }
  }, []);


  // 単一ファイルのアップロード処理
  const uploadImage = async (fileId: string, file: any): Promise<string | null> => {
    try {
      // dataURL -> Blob 変換
      const res = await fetch(file.dataURL);
      const blob = await res.blob();
      const filename = `page-asset-${fileId}.${file.mimeType.split('/')[1]}`;

      // 1. Presigned URL
      const { uploadUrl, s3Key, uploadSessionId } = await issueUpload(filename, file.mimeType, 'page_asset');

      // 2. S3 Upload
      await uploadToS3(uploadUrl, blob, file.mimeType);

      // 3. Confirm
      await confirmUpload(uploadSessionId);

      // 4. URL生成
      return `${CLOUDFRONT_DOMAIN}/${s3Key}`;
    } catch (e) {
      console.error(`Failed to upload file ${fileId}`, e);
      return null;
    }
  };

  // 保存直前に呼び出す関数
  // 現在のfilesを受け取り、アップロード済みのURLに差し替えた新しいfilesを返す
  const prepareFilesForSave = async (currentFiles: Record<string, any>) => {
    // もしアップロード中のものがあれば待機するロジックをここに入れることも可能
    // 今回は「アップロード完了したものだけ差し替える」簡易実装
    
    const newFiles: Record<string, any> = {};
    
    for (const [fileId, file] of Object.entries(currentFiles)) {
      const remoteUrl = uploadedFilesRef.current.get(fileId);
      if (remoteUrl) {
        // dataURLを削除し、source (または独自のurlフィールド) にリモートURLを入れる
        // Excalidrawの仕様では dataURL がないと表示されないため、
        // 保存用データとして加工する（表示用はそのまま）か、
        // 閲覧時に dataURL を復元する仕組みが必要。
        // 今回の要件（schema.ts）では assets に AssetRef を保存する形なので、それに合わせる。
        
        newFiles[fileId] = {
          ...file,
          dataURL: remoteUrl, // ここを差し替えて保存してしまうのが一番楽（ExcalidrawはURLも読める）
        };
      } else {
        newFiles[fileId] = file;
      }
    }
    return newFiles;
  };

  return {
    handleFilesChange,
    isUploading: uploadingFileIds.size > 0,
    prepareFilesForSave,
  };
};