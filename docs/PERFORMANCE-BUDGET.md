# RoleReady AI — Performance Budget & Core Web Vitals

Production targets and optimization rules for RoleReady AI single-page application.

## Core Web Vitals Targets

| Metric | Target | Description |
|---|---|---|
| **LCP** (Largest Contentful Paint) | `< 1.8s` | Initial render of workspace hero or dashboard view |
| **FID / INP** (Interaction to Next Paint) | `< 50ms` | Instant response when clicking view tabs or sidebar links |
| **CLS** (Cumulative Layout Shift) | `0.00` | Zero layout shift during view switching or state sync |
| **FCP** (First Contentful Paint) | `< 0.9s` | Initial splash gateway background render |

## Asset Size Budgets

- **HTML (index.html)**: `< 150 KB` (gzip)
- **CSS (styles.css)**: `< 60 KB` (gzip)
- **JavaScript (app.js)**: `< 80 KB` (gzip)
- **Fonts**: Preconnected Google Web Fonts (Poppins, Inter, JetBrains Mono)
- **Icons**: Font Awesome CDN loaded asynchronously

## Caching Strategy

- Static JS/CSS assets served with version query cache buster (e.g. `styles.css?v=2.1.7`)
- HTML served with `Cache-Control: no-cache, no-store, must-revalidate` for zero stale code
