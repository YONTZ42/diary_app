import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tldraw をサーバー側でトランスパイル（変換）対象に含める
  transpilePackages: ["tldraw", "@tldraw/tldraw", "@tldraw/validate"],
};

export default nextConfig;