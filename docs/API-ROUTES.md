# RoleReady AI — API Specification & Route Directory

Comprehensive directory of backend endpoints for RoleReady AI (`FastAPI` backend).

## 1. Authentication & Identity
- `POST /api/auth/register` — Register candidate/employer account
- `POST /api/auth/login` — Authenticate and retrieve JWT token
- `GET /api/auth/me` — Retrieve active user session profile

## 2. Core Career Intelligence (Gemini AI)
- `POST /api/extract-resume` — Extract text from PDF, DOCX, TXT, or Markdown
- `POST /api/extract-job-url` — Scrape and extract text from public job requisition URLs
- `POST /api/optimize` — Run Truth-First ATS Resume Analysis & Tailored Bullet Generator
- `POST /api/generate-cover-letter` — Generate evidence-backed tailored cover letters
- `POST /api/generate-salary-strategy` — Calculate comp percentile ranges & negotiation scripts
- `POST /api/generate-outreach` — Generate recruiter cold emails & LinkedIn connection notes
- `POST /api/voice-interview/questions` — Generate dynamic interview questions by category
- `POST /api/voice-interview/report` — Evaluate voice transcript against STAR rubric dimensions

## 3. Employer & Enterprise Screening
- `POST /api/multi-compare` — Compare and rank multiple candidate resumes side-by-side
- `POST /api/publish-leaderboard` — Generate public shareable candidate leaderboard link

## 4. Theme System & Customization
- `GET /api/themes` — List all themes (filter by type: `app|resume`, tier: `free|premium`)
- `GET /api/themes/{id}` — Get specific theme metadata & palette
- `POST /api/themes/{id}/apply` — Apply theme to user account
- `GET /api/user/themes` — Get user's unlocked themes
- `POST /api/user/preferences` — Save UI theme & resume template preferences

## 5. GDPR & Data Rights
- `GET /api/user/export` — Download all held user data as JSON (Right to Data Portability)
- `GET /api/user/data` — Overview of held data categories & retention (Right to Information)
- `POST /api/user/delete` — Schedule permanent account purge within 30 days (Right to Erasure)
- `POST /api/user/consent` — Manage tracking consent preferences (Right to Consent)

## 6. System Diagnostics
- `GET /health` — Health check endpoint (`status: ok`)
- `GET /api/models` — List active Gemini models supporting generation
- `GET /api/diagnostics/config` — (Local only) Inspect model versions & key status
- `POST /api/diagnostics/gemini` — (Local only) Probe Gemini API connection
