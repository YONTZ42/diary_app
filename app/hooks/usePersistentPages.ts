import { useState, useEffect } from 'react';
import { Page } from '../types/schema';
import { generateMockPages } from '../utils/dummyData';

const STORAGE_KEY = 'techo-app-pages-v1';

export const usePersistentPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed: Page[] = JSON.parse(savedData);
        
        // --- ★修正ポイント: ID重複排除ロジック ---
        // Setを使って既出のIDを記録し、重複しているページを除外する
        const seenIds = new Set();
        const uniquePages = parsed.filter(page => {
          if (seenIds.has(page.id)) {
            return false; // 重複なのでスキップ
          }
          seenIds.add(page.id);
          return true;
        });

        setPages(uniquePages);
      } else {
        const initialPages = generateMockPages();
        setPages(initialPages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPages));
      }
    } catch (e) {
      console.error("Failed to load pages:", e);
      setPages(generateMockPages());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updatePages = (newPages: Page[]) => {
    setPages(newPages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPages));
    } catch (e) {
      console.error("Failed to save pages:", e);
    }
  };

  return { pages, updatePages, isLoaded };
};