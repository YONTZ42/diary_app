const FUNCTION_URL =
  "https://3dx3qqjfuoyekmwihg36ypi7xe0axtdm.lambda-url.ap-northeast-1.on.aws/";

type CutoutResponse = { url: string } | { [k: string]: any };

function arrayBufferToBase64(ab: ArrayBuffer): string {
  // btoa は巨大データに弱いので分割
  const bytes = new Uint8Array(ab);
  const chunkSize = 0x8000; // 32KB
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * 受け取ったBlobをbase64にしてpayloadに送り、返ってきたURL画像をBlobに変換して返す
 */
export const applyAutoCutout = async (blob: Blob): Promise<Blob> => {
  // 1) Blob -> base64
  const ab = await blob.arrayBuffer();
  const imageBase64 = arrayBufferToBase64(ab);

  // 2) LambdaへJSON送信（imageBase64必須）
  const payload = { imageBase64 };

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // 必要ならあなたのスクリプトと同じヘッダも付ける :contentReference[oaicite:1]{index=1}
      "X-S3-Bucket": "documentary-bucket",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: CutoutResponse;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 300)}`);
  }
  if (!res.ok) throw new Error(JSON.stringify(data));

  // 3) 返ってきたURLの画像を取得してBlob化
  const url = (data as any).url;
  if (!url || typeof url !== "string") {
    throw new Error(`Response missing "url": ${JSON.stringify(data)}`);
  }

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Failed to fetch cutout image: ${imgRes.status}`);

  return await imgRes.blob();
};
