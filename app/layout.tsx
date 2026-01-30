import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import React from 'react';
import "@excalidraw/excalidraw/index.css"; 

// 日本語フォントの設定
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans-jp',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Techo App',
  description: 'Digital scrapbooking & planner app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // スマホアプリ感を出すためズーム抑制
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased text-slate-900 bg-white">
        {/* 
          Main Layout
          app/page.tsx (SwipeableLayout) がここでレンダリングされます
        */}
        {children}
      </body>
    </html>
  );
}