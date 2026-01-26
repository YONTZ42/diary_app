"use client";

import React, { useState } from 'react';
import { 
  Tldraw, 
  Editor, 
  getSnapshot, 
  loadSnapshot, 
  // TLStoreSnapshot は型エラーの原因になりやすいので削除し、anyで扱います
} from 'tldraw';
import 'tldraw/tldraw.css';

// --- 型定義 ---
type CardData = {
  id: string;
  title: string;
  snapshot: any; // 【修正1】ここを厳密な型から any に変更してエラーを回避
};

// --- サブコンポーネント: 編集用モーダル ---
const EditorModal = ({ 
  initialSnapshot, 
  onSave, 
  onClose 
}: { 
  initialSnapshot: any, 
  onSave: (snapshot: any) => void, 
  onClose: () => void 
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = (editorInstance: Editor) => {
    setEditor(editorInstance);
    if (initialSnapshot) {
      // 【修正2】storeへの読み込み時にエラーが出る場合は any で通すのが安全です
      try {
        loadSnapshot(editorInstance.store, initialSnapshot);
      } catch (e) {
        console.error("スナップショットの読み込みに失敗:", e);
      }
    }
  };

  const handleSaveAndClose = () => {
    if (!editor) return;
    // 【修正3】getSnapshotの使用
    const snapshot = getSnapshot(editor.store);
    onSave(snapshot);
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <span>編集モード</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose}>キャンセル</button>
            <button onClick={handleSaveAndClose} style={styles.primaryButton}>保存して閉じる</button>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Tldraw onMount={handleMount} />
        </div>
      </div>
    </div>
  );
};

// --- サブコンポーネント: カード ---
const TldrawCard = ({ 
  data, 
  onEdit 
}: { 
  data: CardData, 
  onEdit: () => void 
}) => {
  const handleMount = (editor: Editor) => {
    if (data.snapshot) {
      try {
        // 【修正4】ここでも loadSnapshot を安全に実行
        loadSnapshot(editor.store, data.snapshot);
        
        // 読み込み直後は座標がずれていることがあるため、少し待ってからZoom調整するとより確実です
        setTimeout(() => {
            editor.zoomToFit();
        }, 50);
      } catch (e) {
        console.error("カード表示エラー:", e);
      }
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3>{data.title}</h3>
        <button onClick={onEdit} style={styles.editButton}>編集</button>
      </div>
      
      <div style={styles.cardCanvasWrapper}>
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <Tldraw 
            
            hideUi 
            onMount={handleMount}
            // データの変更を検知して再描画させるためのキー
            key={data.snapshot ? JSON.stringify(data.snapshot).length : 'empty'} 
          />
        </div>
      </div>
    </div>
  );
};

// --- メインコンポーネント ---
export default function TldrawCardsApp() {
  const [cards, setCards] = useState<CardData[]>([
    { id: '1', title: 'カード 1', snapshot: null },
    { id: '2', title: 'カード 2', snapshot: null },
    { id: '3', title: 'カード 3', snapshot: null },
  ]);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const targetCard = cards.find(c => c.id === editingCardId);

  const handleSave = (newSnapshot: any) => {
    if (!editingCardId) return;
    
    setCards(prev => prev.map(card => 
      card.id === editingCardId 
        ? { ...card, snapshot: newSnapshot } 
        : card
    ));
  };

  const addCard = () => {
    const newId = (cards.length + 1).toString();
    setCards([...cards, { id: newId, title: `カード ${newId}`, snapshot: null }]);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Tldraw カードリスト</h1>
        <button onClick={addCard} style={styles.addButton}>+ カード追加</button>
      </header>

      <div style={styles.grid}>
        {cards.map(card => (
          <TldrawCard 
            key={card.id} 
            data={card} 
            onEdit={() => setEditingCardId(card.id)} 
          />
        ))}
      </div>

      {editingCardId && targetCard && (
        <EditorModal 
          initialSnapshot={targetCard.snapshot}
          onSave={handleSave}
          onClose={() => setEditingCardId(null)}
        />
      )}
    </div>
  );
}

// --- スタイル定義 (変更なし) ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
  },
  cardHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    padding: '6px 12px',
    cursor: 'pointer',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '4px',
  },
  cardCanvasWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fafafa',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90vw',
    height: '90vh',
    backgroundColor: 'white',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '12px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  primaryButton: {
    padding: '6px 16px',
    cursor: 'pointer',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  }
};