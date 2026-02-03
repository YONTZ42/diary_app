import React from 'react';

interface PhotoCutoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (imageBlob: Blob) => void;
}

export const PhotoCutoutPanel: React.FC<PhotoCutoutPanelProps> = ({ isOpen, onClose, onComplete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="text-sm">キャンセル</button>
        <span className="font-bold">切り抜き</span>
        <button 
          onClick={() => onComplete(new Blob())} // 仮実装
          className="text-sm text-yellow-400 font-bold"
        >
          次へ
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <p>写真をアップロードして</p>
          <p>被写体をタップしてください</p>
          {/* ここにCanvas/OpenCVによる切り抜きUIが入る */}
        </div>
      </div>

      <div className="h-24 bg-gray-800 p-4">
        <div className="text-center text-xs">自動選択ツール / ブラシツール</div>
      </div>
    </div>
  );
};