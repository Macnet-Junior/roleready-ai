# RoleReady AI — Changelog & Version History

All notable changes to the RoleReady AI platform are documented in this file.

## [v2.2.0] - 2026-08-28 (Final Editorial Release)

### Core Polish & Production Hardening
- **Zero-Execution Landing Page**: Defaulted candidate metrics to clean neutral placeholders (`0`, `—`, `Pending Execution`). Numbers calculate dynamically strictly after task execution.
- **Complete 23-Screen Master Architecture**: Fully mapped and responsive across Candidate & Employer portals.
- **Security & Data Protection**: HTTP security headers middleware (`CSP`, `nosniff`, `XSS-Protection`, `DENY` iframe), prompt injection defense, and PII redaction.
- **GDPR Rights Endpoints**: Active endpoints for data export (`/api/user/export`), account erasure (`/api/user/delete`), data inventory (`/api/user/data`), and consent management (`/api/user/consent`).
- **Zero-Cost Production Blueprint**: Gemini 2.5 Flash for text tasks + Browser Web Speech API for voice STT/TTS ($0/mo operating cost).
- **Test Suite**: 39/39 passing pytest test cases.

## [v2.1.8] - 2026-08-28

### UX Refinements
- **Empty State Placeholders**: Updated Candidate Dashboard metric cards and readiness score ring to hide static numbers on initial load.
- **On-Demand Demo Data**: Added `Load Sample Data` button to Application Tracker toolbar.

## [v2.1.7] - 2026-08-28

### Security & Privacy
- **GDPR Endpoints**: Implemented `/api/user/export`, `/api/user/delete`, `/api/user/data`, and `/api/user/consent`.
- **HTTP Security Middleware**: Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy`.
