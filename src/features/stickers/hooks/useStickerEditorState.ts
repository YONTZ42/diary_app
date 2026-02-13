import { useState, useCallback } from 'react';

export const useStickerEditorState = () => {
  // 履歴スタック (Blobの配列)
  const [history, setHistory] = useState<Blob[]>([]);
  // 現在のインデックス
  const [currentIndex, setCurrentIndex] = useState(-1);

  // 現在の画像Blob
  const currentBlob = currentIndex >= 0 ? history[currentIndex] : null;

  // 新しい画像をセット（履歴追加）
  const pushState = useCallback((blob: Blob) => {
    setHistory(prev => {
      // 現在位置より先（Redo可能な未来）を捨てて新しいのを追加
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, blob];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  // 初期化
  const init = useCallback((blob: Blob) => {
    setHistory([blob]);
    setCurrentIndex(0);
  }, []);

  return {
    currentBlob,
    pushState,
    undo,
    redo,
    init,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};