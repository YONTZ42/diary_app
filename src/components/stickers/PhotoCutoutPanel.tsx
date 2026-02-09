"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Scissors, Wand2, Type, Upload, RotateCcw } from 'lucide-react';
import { processManualCutout, processAutoCutout, processTextExtract, CutoutMode } from '@/features/stickers/utils/imageProcessors';
const MODES: CutoutMode[] = ['manual', 'auto', 'text'];


interface PhotoCutoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (imageBlob: Blob) => void;
}

export const PhotoCutoutPanel: React.FC<PhotoCutoutPanelProps> = ({ isOpen, onClose, onComplete }) => {
  const [mode, setMode] = useState<CutoutMode>('manual');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setPoints([]);
      setMode('manual');
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setPoints([]);
    }
  };

  // Canvas描画 (Manual用プレビュー)
  useEffect(() => {
    if (mode === 'manual' && canvasRef.current && imageRef.current && imageSrc) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = 1.0;

      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        
        ctx.strokeStyle = (!isDrawing && points.length > 2) ? '#ffff00' : '#ff0000';
        if (!isDrawing && points.length > 2) ctx.closePath();
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  }, [mode, imageSrc, points, isDrawing]);

  // マウスイベント関連 (Manual)
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  const startDraw = (e: any) => { if (mode === 'manual') { setIsDrawing(true); setPoints([getPos(e)]); } };
  const moveDraw = (e: any) => { if (isDrawing && mode === 'manual') setPoints(prev => [...prev, getPos(e)]); };
  const endDraw = () => setIsDrawing(false);

  // 完了処理：ロジック呼び出し
  const handleComplete = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    try {
      let blob: Blob | null = null;
      if (mode === 'manual') {
        blob = await processManualCutout(imageRef.current, points);
      } else if (mode === 'auto') {
        blob = await processAutoCutout(imageRef.current);
      } else if (mode === 'text') {
        blob = await processTextExtract(imageRef.current);
      }

      if (blob) onComplete(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full"><X size={24} /></button>
        <span className="font-bold text-sm tracking-wider">CREATE STICKER</span>
        <button onClick={handleComplete} disabled={!imageSrc || isProcessing} className="flex items-center gap-1 text-sm text-yellow-400 font-bold disabled:opacity-50">
          {isProcessing ? 'Processing...' : 'Next'} <Check size={18} />
        </button>
      </div>
      
      {/* Workspace */}
      <div className="flex-1 relative flex items-center justify-center bg-[#1a1a1a] overflow-hidden">
        {!imageSrc ? (
          <label className="flex flex-col items-center gap-4 cursor-pointer p-8 rounded-xl hover:bg-gray-800 transition">
            <div className="bg-gray-800 p-6 rounded-full"><Upload size={48} className="text-gray-400" /></div>
            <p className="text-gray-400 font-bold">Tap to upload photo</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="relative max-w-full max-h-full p-4">
            <img ref={imageRef} src={imageSrc} alt="source" className="hidden" onLoad={() => setPoints([])} />
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[70vh] object-contain shadow-2xl border border-gray-700"
              style={{ display: mode === 'manual' ? 'block' : 'none' }}
              onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw}
              onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
            />
            {mode !== 'manual' && (
              <div className="relative max-w-full max-h-[70vh]">
                <img src={imageSrc} alt="preview" className="max-w-full max-h-[70vh] object-contain opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="bg-black/70 px-6 py-3 rounded-lg text-sm font-bold backdrop-blur-md">
                      {mode === 'auto' ? 'AI Auto Cut (Simulation)' : 'Text Extract (Simulation)'}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      {imageSrc && (
        <div className="bg-black border-t border-gray-800 pb-safe">
          <div className="flex justify-center py-2 border-b border-gray-900">
             {mode === 'manual' && <button onClick={() => setPoints([])} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><RotateCcw size={12} /> Reset Path</button>}
          </div>
          <div className="grid grid-cols-3 h-20">
            {MODES.map((m) => ( // MODES配列を使うことで型推論が効く
              <button 
                key={m} 
                onClick={() => setMode(m)} // キャスト不要
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${mode === m ? 'text-white bg-gray-800' : 'text-gray-500'}`}
              >
                {m === 'manual' ? <Scissors size={24} /> : m === 'auto' ? <Wand2 size={24} /> : <Type size={24} />}
                <span className="text-[10px] font-bold uppercase">{m}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};