"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { X, Check, Loader2, Sliders } from 'lucide-react';
import useImage from 'use-image';
import { StickerStyleConfig, processStickerStyle } from '@/features/stickers/utils/imageProcessing';

interface StickerEditorPanelProps {
  isOpen: boolean;
  imageBlob: Blob | null;
  manualPoints?: number[];
  onClose: () => void;
  onComplete: (finalBlob: Blob, style: StickerStyleConfig) => void;
}

export const StickerEditorPanel: React.FC<StickerEditorPanelProps> = ({ 
  isOpen, imageBlob, manualPoints = [], onClose, onComplete 
}) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ w: 300, h: 300, scale: 1 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // スタイル設定
  const [config, setConfig] = useState<StickerStyleConfig>({
    borderWidth: 15,
    borderColor: '#ffffff',
    borderRoughness: 0,
    shadowBlur: 15,
    shadowOpacity: 0.3,
    shadowOffset: { x: 8, y: 8 },
    textureType: 'none',
  });

  const stageRef = useRef<Konva.Stage>(null);
  const [paperTexture] = useImage('/textures/paper.png'); // public/textures/に配置推奨
  const [glossyTexture] = useImage('/textures/glossy.png');

  // 画像ロード & リサイズ
  useEffect(() => {
    if (isOpen && imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setImageObj(img);
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight * 0.55;
        // 枠線や影のために余白を確保
        const padding = 100;
        const scale = Math.min(
          (maxWidth - padding) / img.width, 
          (maxHeight - padding) / img.height
        );
        setStageSize({ 
          w: img.width * scale + padding * 2, 
          h: img.height * scale + padding * 2, 
          scale 
        });
      };
    } else {
      setImageObj(null);
    }
  }, [isOpen, imageBlob]);

  // 保存処理
  const handleSave = async () => {
    if (!imageObj) return;
    setIsProcessing(true);
    try {
      // 画面キャプチャではなく、ユーティリティ関数で高品質に生成する
      const blob = await processStickerStyle(imageObj, config, manualPoints);
      if (blob) {
        onComplete(blob, config);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 粗さ表現のためのポイント加工 (useMemoで計算)
  const roughenedPoints = useMemo(() => {
    if (!manualPoints || manualPoints.length === 0 || config.borderRoughness === 0) return manualPoints;
    
    // 簡易的なラフネス処理：点をランダムにずらす
    // 描画サイクルごとに変わらないよう固定計算する
    return manualPoints.map((p, i) => {
        // x, y どちらも少しずらす
        const seed = (i * 12345) % 100; // 決定論的乱数もどき
        const offset = (seed / 100 - 0.5) * config.borderRoughness * 2;
        return p + offset;
    });
  }, [manualPoints, config.borderRoughness]);

  // 中央配置オフセット
  const offsetX = (stageSize.w - (imageObj?.width || 0) * stageSize.scale) / 2;
  const offsetY = (stageSize.h - (imageObj?.height || 0) * stageSize.scale) / 2;


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white text-gray-900 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
        <h2 className="font-bold text-sm tracking-wider uppercase flex items-center gap-2">
          <Sliders size={16} /> Edit Style
        </h2>
        <button 
          onClick={handleSave} 
          disabled={!imageObj || isProcessing} 
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full font-bold shadow-md active:scale-95 disabled:opacity-50 text-xs transition-all hover:bg-slate-800"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
          Finish
        </button>
      </div>

      {/* Preview Stage */}
      <div className="flex-1 relative flex items-center justify-center bg-[#F4F4F5] overflow-hidden">
        {imageObj ? (
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            className="shadow-inner"
          >
            <Layer>
              {/* 背景 (透明グリッド) */}
              <Rect 
                width={stageSize.w} 
                height={stageSize.h} 
                fillPatternImage={undefined} // 本当は画像ロード必要だが、CSSで代用可
                fill="#f4f4f5" // 背景色
              />

              <Group x={offsetX} y={offsetY} scaleX={stageSize.scale} scaleY={stageSize.scale}>
                
                {/* 1. Shadow (最背面) */}
                <Group
                  x={config.shadowOffset.x}
                  y={config.shadowOffset.y}
                  opacity={config.shadowOpacity}
                >
                   {manualPoints.length > 0 ? (
                      <Line
                        points={roughenedPoints} // 枠線と同じ形状
                        stroke="black"
                        strokeWidth={config.borderWidth}
                        fill="black"
                        closed={true}
                        lineJoin="round"
                        lineCap="round"
                        tension={0.3}
                        // ぼかし (ShadowBlur) はKonvaのshadowBlurプロパティを使うか、フィルタを使う
                        // ここではGroup全体にフィルタをかけるのが簡単
                        shadowColor="black"
                        shadowBlur={config.shadowBlur}
                        shadowOpacity={1} // Groupのopacityで制御するのでここは1
                        shadowOffsetX={0} // 既にGroupでずらしているので0
                        shadowOffsetY={0}
                      />
                   ) : (
                      // パスがない場合（Auto切り抜き後など）
                      // 画像のシルエットに対して影を落とす
                      <KonvaImage 
                        image={imageObj} 
                        filters={[Konva.Filters.Brighten]} 
                        brightness={-1} // 黒くする
                        shadowColor="black"
                        shadowBlur={config.shadowBlur}
                        shadowOpacity={1}
                      />
                   )}
                </Group>

                {/* 2. Border (枠線) */}
                {manualPoints.length > 0 ? (
                  <Line
                    points={roughenedPoints}
                    stroke={config.borderColor}
                    strokeWidth={config.borderWidth}
                    fill={config.borderColor} // 中も塗りつぶして「下地」にする
                    closed={true}
                    lineJoin="round"
                    lineCap="round"
                    tension={0.3 - (config.borderRoughness * 0.02)} // 粗いときはテンション下げる
                  />
                ) : (
                   // パスがない場合は枠線なし（または画像拡大ハック）
                   // 簡易的に枠線なしとする
                   null
                )}

                {/* 3. Main Image */}
                <KonvaImage image={imageObj} />

                {/* 4. Texture Overlay */}
                {config.textureType === 'paper' && paperTexture && (
                  <KonvaImage image={paperTexture} width={imageObj.width} height={imageObj.height} globalCompositeOperation="multiply" opacity={0.3} listening={false} />
                )}
                {config.textureType === 'glossy' && glossyTexture && (
                  <KonvaImage image={glossyTexture} width={imageObj.width} height={imageObj.height} globalCompositeOperation="screen" opacity={0.4} listening={false} />
                )}

              </Group>
            </Layer>
          </Stage>
        ) : <Loader2 className="animate-spin text-gray-400" />}
      </div>

      {/* Controls */}
      <div className="h-2/5 min-h-[320px] bg-white border-t border-gray-200 overflow-y-auto pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
          
          {/* Border Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"/> Cutting Border
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600">Width</label>
                  <span className="text-xs text-gray-400">{config.borderWidth}px</span>
                </div>
                <input 
                  type="range" min="0" max="60" value={config.borderWidth}
                  onChange={e => setConfig({...config, borderWidth: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600">Roughness</label>
                  <span className="text-xs text-gray-400">{config.borderRoughness}</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={config.borderRoughness}
                  onChange={e => setConfig({...config, borderRoughness: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
               <div className="flex gap-3">
                 {['#ffffff', '#000000', '#f4f4f5', '#ffeb3b', '#ff6b6b', '#4ecdc4', '#95a5a6'].map(c => (
                   <button
                     key={c}
                     onClick={() => setConfig({...config, borderColor: c})}
                     className={`w-9 h-9 rounded-full border-2 shadow-sm transition-all ${config.borderColor === c ? 'scale-110 ring-2 ring-blue-500 border-white' : 'border-gray-100'}`}
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Shadow Settings */}
          <div className="space-y-4">
             <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"/> Drop Shadow
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Blur</label>
                <input 
                  type="range" min="0" max="50" value={config.shadowBlur}
                  onChange={e => setConfig({...config, shadowBlur: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Opacity</label>
                <input 
                  type="range" min="0" max="1" step="0.05" value={config.shadowOpacity}
                  onChange={e => setConfig({...config, shadowOpacity: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Texture Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"/> Material Texture
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'none', label: 'None' },
                { id: 'paper', label: 'Paper' },
                { id: 'glossy', label: 'Glossy' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig({...config, textureType: t.id as any})}
                  className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    config.textureType === t.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};