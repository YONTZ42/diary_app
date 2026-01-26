'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'

// tldrawを動的にインポート（SSRを無効化）
const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, { 
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function Page() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw persistenceKey="my-draw" />
    </div>
  )
}