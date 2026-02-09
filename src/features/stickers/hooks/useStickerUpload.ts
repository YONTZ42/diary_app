import { useState } from 'react';
import { issueUpload, uploadToS3, confirmUpload, createSticker } from '@/services/api';
import { Sticker } from '@/types/schema';

const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'https://dxxxx.cloudfront.net';

export const useStickerUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAndCreateSticker = async (blob: Blob): Promise<Sticker> => {
    setIsUploading(true);
    setError(null);

    try {
      // 寸法取得
      const img = new Image();
      const url = URL.createObjectURL(blob);
      await new Promise(r => { img.onload = r; img.src = url; });

      // 1. Presigned URL
      const { uploadUrl, s3Key, uploadSessionId } = await issueUpload('sticker.png', 'image/png', 'sticker_png');

      // 2. S3 Upload
      await uploadToS3(uploadUrl, blob, 'image/png');

      // 3. Confirm
      await confirmUpload(uploadSessionId);

      // 4. Create Model (★修正: 完全なURLを渡す)
      const fullUrl = `${CLOUDFRONT_DOMAIN}/${s3Key}`;
      const newSticker = await createSticker(fullUrl, img.width, img.height);

      return newSticker;
    } catch (e) {
      console.error(e);
      setError('Failed to create sticker');
      throw e;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAndCreateSticker,
    isUploading,
    error
  };
};