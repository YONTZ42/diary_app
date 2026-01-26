import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self'",           // まずは最小から
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  
].join("; ");

const nextConfig: NextConfig = {
  transpilePackages: ["tldraw"],
  experimental: {
    // サーバーコンポーネントとの相性を高める設定
    serverComponentsExternalPackages: ['tldraw'], 
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ★ここが Report-Only
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;