import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {
      colors: {
        // globals.css で定義した変数 (--background, --gold) を
        // Tailwindのクラス (bg-background, text-gold) として使えるようにマッピング
        background: "var(--background)",
        gold: "var(--gold)",
        
        // 設計書の Midnight Navy に近い色を拡張定義
        navy: {
          900: "#0f172a", // Slate-900 base
          800: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"], // ハーフシートのタイトル等に適用されます
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;