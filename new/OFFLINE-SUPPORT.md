# RoleReady — Offline Support (PWA)

## Strategy

Offline-first for viewing. Online-required for AI features.

---

## What Works Offline

```
✅ View dashboard (cached data)
✅ View resume (cached)
✅ View application tracker (cached)
✅ View cover letters (cached)
✅ View interview history (cached)
✅ Navigate between pages
✅ Theme preferences

❌ AI analysis (needs API)
❌ Job matching (needs API)
❌ Cover letter generation (needs API)
❌ Interview practice (needs API + TTS)
❌ Email sending (needs API)
❌ File uploads (needs API)
```

## Service Worker

```typescript
// next-pwa config
// npm install next-pwa

// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/roleready\.ai\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|svg|css|js)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
      }
    }
  ]
});
```

## Offline UI

```
When offline:
- Show banner: "You're offline. Some features are limited."
- Disable AI buttons (grayed out with tooltip)
- Show cached data with "Last updated: X minutes ago"
- Queue actions for when back online

When back online:
- Hide offline banner
- Sync queued actions
- Refresh stale data
- Show: "Back online ✓"
```

## Manifest

```json
{
  "name": "RoleReady",
  "short_name": "RoleReady",
  "description": "AI-powered career operating system",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0A1628",
  "theme_color": "#2563EB",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```