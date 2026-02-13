"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import { X, Check, Scissors, Eraser, Wand2, Type, RotateCcw, Upload, Loader2, Undo2, Redo2 } from 'lucide-react';

// ★正しいフックとユーティリティをインポート
import { useStickerEditorState } from '@/features/stickers/hooks/useStickerEditorState';
import { useKonvaDraw, ToolMode } from '@/features/stickers/hooks/useKonvaDraw';
import { applyManualCutout, applyEraser, applyTextExtract } from '@/features/stickers/utils/imageProcessing';
import {  applyAutoCutout } from '@/features/stickers/utils/imageProcessingFromLambda';

interface PhotoCutoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (imageBlob: Blob) => void;
}

const MODES: { id: ToolMode; icon: any; label: string }[] = [
  { id: 'cut', icon: Scissors, label: 'CUT' },
  { id: 'erase', icon: Eraser, label: 'ERASE' },
];

export const PhotoCutoutPanel: React.FC<PhotoCutoutPanelProps> = ({ isOpen, onClose, onComplete }) => {
  // 1. 画像履歴管理 (Undo/Redo)
  const { currentBlob, pushState, undo, redo, canUndo, canRedo, init } = useStickerEditorState();
  
  // 2. 描画ツール管理
  const { mode, setMode, currentPoints, isDrawing, handleMouseDown, handleMouseMove, handleMouseUp, resetDraw } = useKonvaDraw();

  // ローカルステート
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ w: 300, h: 300, scale: 1 });
  const [isLoading, setIsLoading] = useState(false);

  // 初期化・リセット
  useEffect(() => {
    if (!isOpen) {
      setImageObj(null);
      resetDraw();
    }
  }, [isOpen]);

  // currentBlobが変わったら画像を表示 (Undo/Redo時など)
  useEffect(() => {
    if (currentBlob) {
      const url = URL.createObjectURL(currentBlob);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setImageObj(img);
        // リサイズ計算
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight * 0.6;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        setStageSize({ w: img.width * scale, h: img.height * scale, scale });
      };
    } else {
      setImageObj(null);
    }
  }, [currentBlob]);

  // ファイルアップロード
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) init(file);
  };

  // --- アクション ---

  // 手動切り抜き確定
  const applyCut = async () => {
    if (!imageObj || currentPoints.length < 6) return;
    setIsLoading(true);
    try {
      const newBlob = await applyManualCutout(imageObj, currentPoints);
      if (newBlob) {
        pushState(newBlob);
        resetDraw();
        // 完了したらViewモードに戻すなどのUXも可
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // 消しゴム確定 (マウスアップ時に自動適用する場合のロジック)
  // useKonvaDraw側で mouseUp を検知していないため、useEffectで監視するか、
  // handleMouseUpをラップして処理を挟む必要がある。
  // ここではシンプルに、Stageの onMouseUp で判定する。
  const handleStageMouseUp = async () => {
    handleMouseUp(); // フックの状態更新
    
    // 消しゴムモードで線が描かれていたら即座に適用（UX向上）
    if (mode === 'erase' && currentPoints.length > 2 && imageObj) {
      setIsLoading(true);
      // 線の太さは画像のスケールに合わせて調整 (例: 画面上で20pxに見える太さ)
      const lineWidth = 20 / stageSize.scale;
      const newBlob = await applyEraser(imageObj, [{ points: currentPoints, width: lineWidth }]);
      if (newBlob) {
        pushState(newBlob);
        resetDraw(); // 線を消して新しい画像に差し替え
      }
      setIsLoading(false);
    }
  };

  // 自動切り抜き
  const runAuto = async () => {
    if (!currentBlob) return;
    setIsLoading(true);
    try {
      const newBlob = await applyAutoCutout(currentBlob);
      pushState(newBlob);
    } catch(e) { alert('Failed'); }
    setIsLoading(false);
  };

  // テキスト抽出
  const runText = async () => {
    if (!imageObj) return;
    setIsLoading(true);
    try {
      const newBlob = await applyTextExtract(imageObj);
      if (newBlob) pushState(newBlob);
    } catch(e) { alert('Failed'); }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 bg-[#1a1a1a]">
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"><X size={24} /></button>
        <div className="flex gap-4">
           <button onClick={undo} disabled={!canUndo} className="text-gray-400 hover:text-white disabled:opacity-30"><Undo2 size={20} /></button>
           <button onClick={redo} disabled={!canRedo} className="text-gray-400 hover:text-white disabled:opacity-30"><Redo2 size={20} /></button>
        </div>
        <button 
          onClick={() => currentBlob && onComplete(currentBlob)} 
          disabled={!currentBlob || isLoading} 
          className="flex items-center gap-1 text-sm text-yellow-400 font-bold disabled:opacity-50"
        >
          Next <Check size={18} />
        </button>
      </div>
      
      {/* Main Canvas */}
      <div className="flex-1 relative flex items-center justify-center bg-[#111] overflow-hidden">
        {!currentBlob ? (
          <label className="flex flex-col items-center gap-4 cursor-pointer p-12 border-2 border-dashed border-gray-700 rounded-2xl hover:border-gray-500 transition-colors">
            <Upload size={48} className="text-gray-500" />
            <span className="text-gray-400 font-bold">Upload Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="animate-spin text-white" size={48} />
              </div>
            )}
            
            <Stage
              width={stageSize.w}
              height={stageSize.h}
              scaleX={stageSize.scale}
              scaleY={stageSize.scale}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleStageMouseUp} // ★ここを差し替え
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleStageMouseUp} // ★ここも差し替え
              className="shadow-2xl border border-gray-800 bg-[url('https://placehold.co/20x20/222/333/png')] bg-repeat"
            >
              <Layer>
                {imageObj && <KonvaImage image={imageObj} />}
                
                {/* 描画中の線 (消しゴム) - プレビュー用 */}
                {mode === 'erase' && currentPoints.length > 0 && (
                  <Line 
                    points={currentPoints} 
                    stroke="rgba(255, 0, 0, 0.5)" // 赤く半透明で表示
                    strokeWidth={20 / stageSize.scale} 
                    lineCap="round" 
                    lineJoin="round" 
                  />
                )}

                {/* 描画中の線 (切り抜き) - プレビュー用 */}
                {mode === 'cut' && currentPoints.length > 0 && (
                  <Line 
                    points={currentPoints} 
                    stroke="#FFD700" 
                    strokeWidth={3 / stageSize.scale} 
                    closed={true} // プレビュー中は閉じて見せる
                    fill="rgba(255, 215, 0, 0.2)" 
                  />
                )}
              </Layer>
            </Stage>
          </>
        )}
      </div>

      {/* Toolbar */}
      {currentBlob && (
        <div className="bg-[#1a1a1a] border-t border-gray-800 pb-safe">
          
          {/* Sub Toolbar (Contextual Actions) */}
          <div className="h-14 border-b border-gray-800 flex items-center justify-center px-4 bg-[#222]">
             {mode === 'cut' ? (
                <div className="flex gap-4 w-full justify-center items-center">
                   <button 
                     onClick={resetDraw} 
                     disabled={currentPoints.length === 0}
                     className="text-xs flex items-center gap-1 text-gray-400 hover:text-white px-3 py-1.5 rounded disabled:opacity-30 transition-colors"
                   >
                     <RotateCcw size={14} /> Clear Path
                   </button>
                   <button 
                     onClick={applyCut} 
                     disabled={currentPoints.length < 6}
                     className="bg-yellow-500 text-black text-xs font-bold px-6 py-2 rounded-full shadow-lg hover:bg-yellow-400 disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2"
                   >
                     <Scissors size={14} /> Cut Area
                   </button>
                </div>
             ) : (
                <span className="text-[10px] text-gray-600">Select Mode</span>
             )}
          </div>

          {/* Main Toolbar (Mode Switcher) */}
          <div className="grid grid-cols-4 h-24">
            {MODES.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`flex flex-col items-center justify-center gap-1.5 transition-all ${
                  mode === item.id 
                    ? 'text-yellow-400 bg-[#2a2a2a]' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className={`p-2 rounded-full ${mode === item.id ? 'bg-yellow-400/10' : ''}`}>
                  <item.icon size={26} strokeWidth={mode === item.id ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
              </button>
            ))}
            <button onClick={runAuto} disabled={isLoading} className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-purple-400">
               <div className="p-2"><Wand2 size={26} /></div>
               <span className="text-[10px] font-bold tracking-wider">AUTO</span>
            </button>
            <button onClick={runText} disabled={isLoading} className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-blue-400">
               <div className="p-2"><Type size={26} /></div>
               <span className="text-[10px] font-bold tracking-wider">TEXT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};