'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'

// tldrawをSSR（サーバーサイドレンダリング）から除外して読み込む
const Tldraw = dynamic(async () => {
  const { Tldraw } = await import('tldraw')
  return Tldraw
}, { 
  ssr: false,
  // 読み込み中に表示する内容（任意）
  loading: () => <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
})


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