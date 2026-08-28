# RoleReady — Performance Budget

## Targets

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| First Input Delay | < 100ms | Web Vitals |
| Total Bundle Size | < 250KB (gzipped) | Webpack |
| Image Size | < 200KB each | Manual |
| API Response Time | < 500ms (p95) | Sentry |
| AI Analysis Time | < 30s | Custom |

## Bundle Budget

```
Framework (Next.js + React):  < 100KB gzipped
UI Components (shadcn):       < 50KB gzipped
Charts/Visualizations:        < 30KB gzipped
Utilities:                    < 20KB gzipped
Fonts:                        < 50KB total
Total JS:                     < 250KB gzipped
Total CSS:                    < 30KB gzipped
```

## Image Optimization

```
- Use WebP/AVIF format
- Lazy load below-fold images
- Responsive images (srcset)
- Max 200KB per image
- Use Next.js Image component (auto-optimizes)
- Placeholder blur for loading state
```

## Caching Strategy

```
Static assets:  Cache-Control: max-age=31536000 (1 year, immutable)
API responses:  Cache-Control: max-age=300 (5 minutes)
HTML pages:     Cache-Control: max-age=0, must-revalidate
Fonts:          Cache-Control: max-age=31536000
```

## Monitoring

```
- Vercel Analytics (Core Web Vitals)
- Sentry Performance (API latency)
- PostHog (page load times)
- Lighthouse CI (automated checks on deploy)
```