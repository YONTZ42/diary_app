import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google"; // 任意のフォント
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "@excalidraw/excalidraw/index.css";

// フォント設定例
const inter = Inter({ subsets: ["latin"] });
const serif = Noto_Serif_JP({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deco Techo",
  description: "Digital scrapbooking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${serif.className}`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}