// src/hooks/useImageUpload.ts

import { useState } from 'react';
import { issueUpload, uploadToS3, confirmUpload } from '@/services/api';

const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'https://dxxxx.cloudfront.net';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 画像をS3にアップロードし、CloudFrontのURLを返す
   */
  const uploadImage = async (file: File | Blob, purpose: string = 'notebook_cover'): Promise<{ url: string, width: number, height: number }> => {
    setIsUploading(true);
    setError(null);

    try {
      // 寸法取得
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise(r => { img.onload = r; img.src = objectUrl; });

      // 1. Presigned URL
      const filename = `image-${Date.now()}.png`; // 簡易名
      const mimeType = file.type || 'image/png';
      
      const { uploadUrl, s3Key, uploadSessionId } = await issueUpload(filename, mimeType, purpose);

      // 2. S3 Upload
      await uploadToS3(uploadUrl, file, mimeType);

      // 3. Confirm
      await confirmUpload(uploadSessionId);

      return {
        url: `${CLOUDFRONT_DOMAIN}/${s3Key}`,
        width: img.width,
        height: img.height
      };
    } catch (e) {
      console.error(e);
      setError('Failed to upload image');
      throw e;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, error };
};