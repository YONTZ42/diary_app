'use client'

import { Tldraw } from 'tldraw'
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