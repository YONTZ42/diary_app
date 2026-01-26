import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import FooterNav from './components/FooterNav';
import "@excalidraw/excalidraw/index.css";
import "tldraw/tldraw.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>

        {children}

        
      </body>
    </html>
  );
}
