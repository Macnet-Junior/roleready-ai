# RoleReady AI — Changelog & Version History

All notable changes to the RoleReady AI platform are documented in this file.

## [v2.1.7] - 2026-08-28

### Security & Privacy
- **GDPR Endpoints**: Implemented `/api/user/export`, `/api/user/delete`, `/api/user/data`, and `/api/user/consent` for full compliance.
- **HTTP Security Middleware**: Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy`.
- **Injection Defense**: Redacted PII (`[PHONE_REDACTED]`, `[SSN_REDACTED]`) and filtered prompt injection vectors.

## [v2.1.5] - 2026-08-28

### Navigation & UX
- **23-Screen Master Map Alignment**: Updated Candidate and Employer sidebar sections (`Main`, `Prepare`, `Apply`, `Interview`, `Negotiate`, `Account`, `Employer`, `Communications`, `Config`).

## [v2.1.3] - 2026-08-28

### Feature Additions
- **Mock Interview Dark Mode**: Added `#view-cand-mock-interview` featuring real-time STAR telemetry, timer, AI hiring coach (`🤖 Alex`), and hint system.

## [v2.1.1] - 2026-08-28

### Design System
- **Theme Gallery Screen**: Added `#view-cand-themes` with category filtering for Resume Templates ($3.99 - $5.99) and App UI Skins.

## [v2.1.0] - 2026-08-28

### Backend APIs
- **Theme System Endpoints**: `/api/themes`, `/api/themes/{id}`, `/api/themes/{id}/apply`, `/api/user/themes`, `/api/user/preferences`.
- **CSS Custom Properties**: Controlled `:root` variables (`--color-primary`, `--color-bg`, `--font-heading`, `--radius-base`).

## [v2.0.9] - 2026-08-28

### Monetization
- **Pricing & Upgrade Modal**: Added `modal-pricing-upgrade` with Candidate Pro ($15/mo - $19/mo) and Enterprise seat tiers.
