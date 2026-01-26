import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // tldrawはWeb Workerを使用するため blob: を追加
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
  // インラインスタイルを許可
  "style-src 'self' 'unsafe-inline'",
  // tldrawの画像処理やアセットのために data: blob: を許可
  "img-src 'self' data: blob: https://*",
  // フォントアセットの許可
  "font-src 'self' data:",
  // 外部APIやアセット取得のための接続許可
  "connect-src 'self' https: blob: data:",
  // Web Worker用のソース指定
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // tldrawはesmとして提供されているため、最新のNext.jsではtranspileが必要ない場合も多いですが、
  // 依存関係でのエラーを防ぐために含めておきます。
  transpilePackages: ["tldraw"],
  
  // キャッシュやSSR時のエラーを回避するための設定
  serverExternalPackages: ['tldraw'],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // 開発中は Report-Only にしておき、ブラウザのコンソールで違反がないか確認するのが安全です
            key: "Content-Security-Policy-Report-Only",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;