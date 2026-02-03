import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sticker, StickerStyle } from '@/types/schema';

// アセットURL解決ヘルパー（他と同じ）
const getAssetUrl = (asset: any) => {
  if (!asset || !asset.key) return '/placeholder.png';
  return asset.key.startsWith('http') ? asset.key : `/mock/${asset.key}`;
};

interface StickerEditorProps {
  isOpen: boolean;
  sticker: Sticker | null;
  onClose: () => void;
  onSave: (style: StickerStyle) => void;
}

export const StickerEditor: React.FC<StickerEditorProps> = ({ isOpen, sticker, onClose, onSave }) => {
  // 編集用ステート
  const [style, setStyle] = useState<StickerStyle>({
    outline: { enabled: false, size: 0, color: '#ffffff' },
    shadow: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, opacity: 0 }
  });

  // ステッカーが開かれるたびに初期値をセット
  useEffect(() => {
    if (sticker) {
      setStyle(sticker.style);
    }
  }, [sticker]);

  if (!isOpen || !sticker) return null;

  // CSSフィルター文字列の生成
  const generateFilterStyle = () => {
    const filters = [];
    
    // 影 (Drop Shadow)
    // CSS: drop-shadow(offset-x offset-y blur-radius color)
    if (style.shadow.enabled) {
        // opacityをhexカラーに適用するのは面倒なので、rgbaで簡易計算
        const alpha = style.shadow.opacity;
        filters.push(`drop-shadow(${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px rgba(0,0,0,${alpha}))`);
    }

    // 縁取り (簡易実装)
    // 画像の周囲にクッキリした影を多重にかけることで縁取りに見せるハック
    if (style.outline.enabled && style.outline.size > 0) {
        const s = style.outline.size;
        const c = style.outline.color || '#fff';
        // 上下左右にdrop-shadowをかける
        filters.push(`drop-shadow(${s}px 0 0 ${c}) drop-shadow(-${s}px 0 0 ${c}) drop-shadow(0 ${s}px 0 ${c}) drop-shadow(0 -${s}px 0 ${c})`);
    }

    return filters.join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom-10 fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-white/80 backdrop-blur-md">
        <button onClick={onClose} className="text-sm font-medium text-gray-500">キャンセル</button>
        <h2 className="font-bold text-gray-800">ステッカー編集</h2>
        <button 
          className="text-sm font-bold text-blue-600"
          onClick={() => onSave(style)}
        >
          保存
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[url('https://placehold.co/20x20/e5e7eb/ffffff/png?text=')] bg-repeat flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-64 h-64 transition-all duration-300">
          <div 
             className="relative w-full h-full"
             style={{ filter: generateFilterStyle() }} // ★ここでCSSフィルターを適用
          >
            <Image
              src={getAssetUrl(sticker.png)}
              alt="preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t safe-area-bottom max-h-[40vh] overflow-y-auto">
        
        {/* Outline Control */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-700">縁取り</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" 
                checked={style.outline.enabled}
                onChange={e => setStyle({...style, outline: {...style.outline, enabled: e.target.checked}})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {style.outline.enabled && (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs w-12 text-gray-500">太さ</span>
                    <input 
                        type="range" min="1" max="10" step="1"
                        value={style.outline.size}
                        onChange={e => setStyle({...style, outline: {...style.outline, size: Number(e.target.value)}})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
          )}
        </div>

        {/* Shadow Control */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-700">ドロップシャドウ</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" 
                checked={style.shadow.enabled}
                onChange={e => setStyle({...style, shadow: {...style.shadow, enabled: e.target.checked}})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {style.shadow.enabled && (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs w-12 text-gray-500">ぼかし</span>
                    <input 
                        type="range" min="0" max="20"
                        value={style.shadow.blur}
                        onChange={e => setStyle({...style, shadow: {...style.shadow, blur: Number(e.target.value)}})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs w-12 text-gray-500">距離X</span>
                    <input 
                        type="range" min="-20" max="20"
                        value={style.shadow.offsetX}
                        onChange={e => setStyle({...style, shadow: {...style.shadow, offsetX: Number(e.target.value)}})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs w-12 text-gray-500">距離Y</span>
                    <input 
                        type="range" min="-20" max="20"
                        value={style.shadow.offsetY}
                        onChange={e => setStyle({...style, shadow: {...style.shadow, offsetY: Number(e.target.value)}})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs w-12 text-gray-500">濃さ</span>
                    <input 
                        type="range" min="0" max="1" step="0.1"
                        value={style.shadow.opacity}
                        onChange={e => setStyle({...style, shadow: {...style.shadow, opacity: Number(e.target.value)}})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};