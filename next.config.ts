// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.tldraw.com; connect-src 'self' cdn.tldraw.com; img-src 'self' data: blob: cdn.tldraw.com images.unsplash.com; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ]
  },
}