// lambda-yolo-final.mjs (Node 18+)

const FUNCTION_URL = "https://3dx3qqjfuoyekmwihg36ypi7xe0axtdm.lambda-url.ap-northeast-1.on.aws/";
const IMAGE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&q=80&w=800";

// 任意：S3に保存したい場合（Lambdaが対応しているなら）
const S3_KEY = null; // 例: "cutouts/out.png"

async function main() {
  // 1) 画像URLを取得してBase64化
  const srcRes = await fetch(IMAGE_URL);
  if (!srcRes.ok) throw new Error(`Failed to fetch source image: ${srcRes.status}`);
  const buf = Buffer.from(await srcRes.arrayBuffer());
  const imageBase64 = buf.toString("base64");

  // 2) LambdaへJSON送信（Lambda仕様: imageBase64 必須）
  const payload = {
    imageBase64,
    ...(S3_KEY ? { s3Key: S3_KEY } : {}), // Lambdaが s3Key を見て保存する実装なら有効
  };

  const res = await fetch(FUNCTION_URL, {
    method: "POST",

    headers: {
      "content-type": "application/json",
      "X-S3-Bucket": "documentary-bucket",
    },

    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 300)}`);
  }

  if (!res.ok) throw new Error(JSON.stringify(data));

  // Lambdaが { url: "..."} を返す想定
  console.log("Cutout URL:", data.url ?? data);
}

await main();
