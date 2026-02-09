export type CutoutMode = 'manual' | 'auto' | 'text';

/**
 * 手動切り抜き (パスでクリップ)
 */
export const processManualCutout = async (
  img: HTMLImageElement, 
  points: {x: number, y: number}[]
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (points.length < 3) {
    ctx.drawImage(img, 0, 0);
  } else {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
  }
  
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};

/**
 * 自動切り抜き (仮実装: 円形クリップ)
 */
export const processAutoCutout = async (img: HTMLImageElement): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2.5;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};

/**
 * テキスト抽出 (2値化フィルタ)
 */
export const processTextExtract = async (img: HTMLImageElement): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg < 128 ? 0 : 255; 
    data[i] = val; 
    data[i + 1] = val; 
    data[i + 2] = val; 
    data[i + 3] = val === 255 ? 0 : 255; 
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};