"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Sparkles, 
  ChevronRight, 
  PenTool, 
  Upload, 
  Check, 
  Smile, 
  Coffee, 
  Zap,
  BookOpen,
  MessageCircle
} from "lucide-react";
import clsx from "clsx";

// --- Types ---

type ThemeOption = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  color: string;
};

// --- Mock Data ---

const THEMES: ThemeOption[] = [
  {
    id: "memories",
    emoji: "📸",
    label: "Memories / 思い出",
    desc: "大切な瞬間をスクラップブックのように。",
    color: "bg-orange-50 border-orange-200 text-orange-900"
  },
  {
    id: "journey",
    emoji: "✈️",
    label: "Journey / 旅路",
    desc: "これまでの道のりを地図のように描く。",
    color: "bg-blue-50 border-blue-200 text-blue-900"
  },
  {
    id: "growth",
    emoji: "🌱",
    label: "Growth / 成長",
    desc: "変化と進化の記録をスタイリッシュに。",
    color: "bg-green-50 border-green-200 text-green-900"
  }
];

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
];

const DIARY_LOGS = [
    { id: 1, date: "10.12", img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&q=80", text: "霧が晴れていく瞬間。誰にも邪魔されない時間。", qa: {q: "色は？", a: "白と青。"} },
    { id: 2, date: "10.15", img: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&q=80", text: "交差点の信号が変わる音。急ぐ人々の足音。", qa: {q: "音は？", a: "都市のノイズ。"} },
    { id: 3, date: "10.20", img: "https://images.unsplash.com/photo-1542202229-7d9377a3a716?w=400&q=80", text: "午後の光が差し込むカフェで思考を整理する。", qa: {q: "味は？", a: "深煎りの苦味。"} },
    { id: 4, date: "10.24", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80", text: "何も思い浮かばない日があってもいい。", qa: {q: "気分は？", a: "フラット。"} },
];

// --- Components ---

/**
 * Magazine Preview Card
 */
const MagazinePreview = ({
  theme,
  title,
  coverImage,
}: {
  theme: ThemeOption;
  title: string;
  coverImage: string | null;
}) => {
  return (
    <div className="sticky top-24 w-full max-w-sm mx-auto aspect-[3/4] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative transition-all duration-500">
      {/* Cover Image */}
      <div className="absolute inset-0 bg-gray-50">
        {coverImage ? (
          <img src={coverImage} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Camera size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">No Cover Selected</span>
          </div>
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

      {/* Typography Layer */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none text-white">
        {/* Header */}
        <div className="flex justify-between items-start opacity-90">
          <div>
            <span className="block text-[10px] font-bold tracking-widest uppercase mb-1">Special Feature</span>
            <span className="text-xl font-serif font-black italic tracking-tighter">ARCHIVE</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
               {theme.emoji} {theme.label.split("/")[0]}
            </span>
          </div>
        </div>

        {/* Title Main */}
        <div className="mb-4">
          <h1 className="font-serif text-5xl font-medium leading-[1.1] mb-3 drop-shadow-lg break-words">
            {title || "Untitled"}
          </h1>
          <div className="inline-block border-l-2 border-white/60 pl-3">
            <p className="text-xs font-medium opacity-90 leading-snug">
              {theme.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Timeline Digest Section
 * 日記データを横スクロールで振り返る
 */
const TimelineDigest = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">★</span>
                    <h3 className="text-base font-bold">収録されるエピソード</h3>
                </div>
                <span className="text-xs text-gray-400">Total: {DIARY_LOGS.length} days</span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4 -mx-2 px-2">
                {DIARY_LOGS.map((log) => (
                    <div 
                        key={log.id} 
                        className="snap-start shrink-0 w-60 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                    >
                        <div className="h-32 relative">
                            <img src={log.img} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold">
                                {log.date}
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-gray-700 leading-relaxed mb-3 line-clamp-2">
                                "{log.text}"
                            </p>
                            <div className="bg-gray-50 rounded p-2 flex gap-2 items-start">
                                <MessageCircle size={12} className="text-orange-400 shrink-0 mt-0.5" />
                                <div className="text-[10px]">
                                    <span className="text-gray-400 block mb-0.5">Q. {log.qa.q}</span>
                                    <span className="text-gray-700 font-medium">A. {log.qa.a}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Step 1: Character Selector (Enhanced with AI)
 */
const CharacterSelector = ({
  selectedImage,
  onSelect,
}: {
  selectedImage: string | null;
  onSelect: (url: string) => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    setIsGenerating(true);
    setTimeout(() => {
        const mockResult = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=90"; 
        setGeneratedImage(mockResult);
        onSelect(mockResult);
        setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
        <h3 className="text-base font-bold">表紙の顔（主演）を決める</h3>
      </div>

      {/* Main Feature: AI Model Generation */}
      <div className="relative group overflow-hidden rounded-2xl">
          {/* Animated Background Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative bg-white m-[2px] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              
              {!generatedImage && !isGenerating && (
                  <>
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                        <Sparkles size={24} className="text-orange-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">
                        AIであなたをモデル化
                    </h4>
                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                        自撮りをアップするだけ。<br/>AIが雑誌の表紙にふさわしい雰囲気に仕上げます。
                    </p>
                    <label className="cursor-pointer bg-black text-white text-sm font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <Camera size={16} />
                        <span>写真を選ぶ</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) handleUpload(file);
                        }} />
                    </label>
                  </>
              )}

              {isGenerating && (
                  <div className="py-6 flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-3" />
                      <span className="text-sm font-bold text-orange-500 animate-pulse">モデル生成中...</span>
                      <p className="text-xs text-gray-400 mt-1">最高の一枚を現像しています</p>
                  </div>
              )}

              {generatedImage && (
                  <div className="w-full flex gap-4 items-center animate-in zoom-in duration-300">
                      <div className="w-20 aspect-square rounded-xl overflow-hidden shadow-md relative group-hover:scale-105 transition-transform">
                          <img src={generatedImage} className="w-full h-full object-cover" alt="AI Model" />
                      </div>
                      <div className="flex-1 text-left">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Great Shot! ✨</h4>
                          <p className="text-xs text-gray-500 mb-2">
                              あなたらしい、素敵な表紙になりそうです。
                          </p>
                          <button 
                            onClick={() => { setGeneratedImage(null); onSelect(""); }} 
                            className="text-xs text-orange-600 font-bold hover:underline"
                          >
                              別の写真で試す
                          </button>
                      </div>
                      <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                          <Check size={16} />
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="pt-2">
          <p className="text-xs font-bold text-gray-400 mb-3 text-center">またはストックから選択</p>
          <div className="grid grid-cols-3 gap-3">
            {STOCK_IMAGES.map((url) => (
              <button
                key={url}
                onClick={() => { onSelect(url); setGeneratedImage(null); }}
                className={clsx(
                  "aspect-square rounded-xl overflow-hidden relative transition-all",
                  selectedImage === url 
                    ? "ring-2 ring-black ring-offset-2 opacity-100" 
                    : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                )}
              >
                <img src={url} className="w-full h-full object-cover" alt="Stock" />
                {selectedImage === url && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Check size={20} className="text-white drop-shadow-md" />
                    </div>
                )}
              </button>
            ))}
          </div>
      </div>
    </div>
  );
};

/**
 * Step 2: Theme Selector
 */
const ThemeSelector = ({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (theme: ThemeOption) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
        <h3 className="text-base font-bold">テーマを決める</h3>
      </div>
      <div className="grid gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme)}
            className={clsx(
              "text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group",
              selectedId === theme.id
                ? "border-black bg-white shadow-md ring-1 ring-black/5"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className={clsx("absolute top-0 left-0 bottom-0 w-1.5", theme.color.split(" ")[0])} />
            <div className="pl-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="text-sm font-bold text-gray-900">{theme.label}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                  {theme.desc}
                </p>
              </div>
              <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center", selectedId === theme.id ? "bg-black border-black text-white" : "border-gray-300")}>
                  {selectedId === theme.id && <Check size={12} />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Step 3: Title Input
 */
const TitleInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">3</span>
        <h3 className="text-base font-bold">タイトル</h3>
      </div>
      
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={20}
          className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-xl font-serif font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
        />
        <PenTool size={16} className="absolute right-4 top-4 text-gray-400 group-focus-within:text-black transition-colors pointer-events-none" />
      </div>
    </div>
  );
};

/**
 * Step 4: Editorial Memo
 */
const EditorialMemoInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">4</span>
        <h3 className="text-base font-bold">編集後記（メモ）</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black/5 transition-all">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="この期間を振り返って、残しておきたい言葉..."
          className="w-full text-sm leading-relaxed resize-none focus:outline-none min-h-[80px] placeholder-gray-400"
        />
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} /> AI Summary
            </span>
            <span className="text-[10px] text-gray-400">Optional</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function GrandEditPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(THEMES[0]);
  const [title, setTitle] = useState("My Grand Story");
  const [coverImage, setCoverImage] = useState<string | null>(STOCK_IMAGES[0]);
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        console.log("Published!", { selectedTheme, title, coverImage, memo });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans pb-20">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button className="flex items-center gap-1 group text-gray-500 hover:text-black transition-colors">
          <span className="text-lg">✕</span>
          <span className="text-xs font-bold">キャンセル</span>
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Grand Issue Setup
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        
        {/* Left: Preview Area */}
        <div className="order-1 lg:order-1 lg:sticky lg:top-24">
            <MagazinePreview 
                theme={selectedTheme} 
                title={title} 
                coverImage={coverImage} 
            />
            <p className="text-center text-[10px] text-gray-400 mt-4 tracking-widest uppercase">
                Preview
            </p>
        </div>

        {/* Right: Form Area */}
        <div className="order-2 lg:order-2 space-y-12">
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">特集号を編む</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                    これまでの記録をまとめて、特別な一冊を作りましょう。<br/>
                    あなたの物語を、美しい形で残します。
                </p>
            </div>

            {/* Timeline Digest (Added) */}
            <TimelineDigest />

            {/* Step 1: Character (Enhanced) */}
            <CharacterSelector 
                selectedImage={coverImage} 
                onSelect={setCoverImage} 
            />

            {/* Step 2: Theme */}
            <ThemeSelector 
                selectedId={selectedTheme.id} 
                onSelect={setSelectedTheme} 
            />

            {/* Step 3: Title */}
            <TitleInput 
                value={title} 
                onChange={setTitle} 
            />

            {/* Step 4: Memo */}
            <EditorialMemoInput 
                value={memo} 
                onChange={setMemo} 
            />

            {/* Submit Action */}
            <div className="pt-4 pb-12">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-black text-white text-sm font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">製本中...</span>
                    ) : (
                        <>
                            <span>特集号を発行する</span>
                            <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>

        </div>

      </main>
    </div>
  );
}