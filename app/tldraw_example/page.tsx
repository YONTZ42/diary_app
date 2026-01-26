'use client'
import dynamic from "next/dynamic";
const Tldraw = dynamic(() => import('tldraw').then((mod) => mod.Tldraw), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 animate-pulse" />
});

import 'tldraw/tldraw.css'

export default function SimpleEditor() {
  return (
    // tldrawは親要素の大きさいっぱいに広がるため、
    // 画面全体に表示するには高さを指定したコンテナが必要です。
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw 
        // persistenceKeyを指定するだけで、ブラウザのIndexedDBに 
        // 編集内容が自動保存され、リロードしても復元されます。
        persistenceKey="my-unique-drawing-key" 
      />
    </div>
  )
}