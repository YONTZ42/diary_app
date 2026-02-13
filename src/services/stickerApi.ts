// src/features/stickers/utils/stickerApi.ts

/**
 * 外部のAI自動切り抜きAPIを呼び出す関数 (ダミー)
 * 最適な形式: バイナリ(Blob)を送信し、透過PNG(Blob)を受け取る
 */
export const fetchAutoCutoutImage = async (originalBlob: Blob): Promise<string> => {
  // 本番ではここで formData を作って fetch する
  // const formData = new FormData();
  // formData.append('image', originalBlob);
  // const res = await fetch('https://api.example.com/rembg', { method: 'POST', body: formData });
  // const blob = await res.blob();
  // return URL.createObjectURL(blob);

  // --- ダミー実装 ---
  return new Promise((resolve) => {
    setTimeout(() => {
      // 本来は切り抜かれた画像が返るが、ここではデモ用に
      // プレースホルダー画像のURLを返す（またはCanvasで加工したDataURL）
      // 実際の実装では、ここでサーバーサイド処理が行われる
      
      // 簡易的に元画像をそのまま返す（実際はサーバー側で背景除去される）
      const url = URL.createObjectURL(originalBlob);
      resolve(url);
    }, 1500); // 1.5秒のラグを演出
  });
};

/**
 * Konva用のカスタムフィルタ: 2値化して白を透明にする (Text Mode用)
 */
export const TextExtractFilter = function (this: any, imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // グレースケール化
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    // 閾値処理 (文字を黒、背景を白に)
    const threshold = 128;
    const val = avg < threshold ? 0 : 255;
    
    // 白(255)なら透明にする
    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    data[i + 3] = val === 255 ? 0 : 255; // A (白なら0=透明)
  }
};