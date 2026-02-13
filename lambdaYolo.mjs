// cutout.mjs
import { writeFile } from "node:fs/promises";

// ✅ ここを自分の値に固定
const IMAGE_URL = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1920&auto=format";
const API_URL ="https://g2bj7jlakss6v2usj4n7iaksm40fhquk.lambda-url.ap-northeast-1.on.aws/";

// ✅ 出力ファイル名も固定（必要なら変えてOK）
const OUT_PATH = "cutout.png";

// ✅ S3に保存したいなら指定（不要なら null のままでOK）
const S3_KEY = null; // 例: "cutouts/out.png"
const S3_BUCKET = null; // 例: "your-bucket-name"

async function cutoutAndSavePng({
  imageUrl,
  apiUrl,
  outPath = "cutout.png",
  s3Key,
  s3Bucket,
}) {
  // 1) 元画像を取得（bytes）
  const srcRes = await fetch(imageUrl);
  if (!srcRes.ok) throw new Error(`Failed to fetch source: ${srcRes.status}`);
  const srcBuf = Buffer.from(await srcRes.arrayBuffer());
  const contentType = srcRes.headers.get("content-type") || "application/octet-stream";

  // 2) Lambdaへ送信
  const headers = { "Content-Type": contentType };
  if (s3Key) headers["X-S3-Key"] = s3Key;
  if (s3Bucket) headers["X-S3-Bucket"] = s3Bucket;

  const cutRes = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: srcBuf,
  });

  if (!cutRes.ok) {
    const t = await cutRes.text().catch(() => "");
    throw new Error(`Cutout API failed: ${cutRes.status} ${t}`);
  }

  // 3) 返ってきたPNGを保存
 const json = await cutRes.json();            // { body: "...", isBase64Encoded: true, ... } になる想定
 const b64 = json.body ?? json;              // 返し方が直の場合も吸収
 const outBuf = Buffer.from(b64, "base64");  // base64 → PNG bytes
 await writeFile(outPath, outBuf);

  // 4) もしS3 URLが返ってきてたら表示
  const s3Url = cutRes.headers.get("x-s3-url");
  if (s3Url) console.log("S3 URL:", s3Url);

  console.log("Saved:", outPath);
}

// 実行
await cutoutAndSavePng({
  imageUrl: IMAGE_URL,
  apiUrl: API_URL,
  outPath: OUT_PATH,
  s3Key: S3_KEY,
  s3Bucket: S3_BUCKET,
});

