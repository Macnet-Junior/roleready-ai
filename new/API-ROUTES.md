# RoleReady — API Routes

## Overview

Next.js App Router API routes. All routes require auth unless marked `public`.

---

## Auth Routes

```
POST   /api/auth/signup          → Create account
POST   /api/auth/login           → Login
POST   /api/auth/logout          → Logout
POST   /api/auth/reset-password  → Send reset email
POST   /api/auth/verify-email    → Verify email
POST   /api/auth/oauth/google    → Google OAuth
POST   /api/auth/oauth/linkedin  → LinkedIn OAuth
GET    /api/auth/me              → Current user profile
```

## Resume Routes

```
POST   /api/resumes              → Upload resume (multipart)
GET    /api/resumes              → List user's resumes
GET    /api/resumes/:id          → Get resume details
PUT    /api/resumes/:id          → Update resume
DELETE /api/resumes/:id          → Delete resume
POST   /api/resumes/:id/analyze  → Run AI analysis
GET    /api/resumes/:id/versions → Get version history
```

## Job Match Routes

```
POST   /api/jobs/match           → Analyze job match (URL or text)
GET    /api/jobs                 → List saved jobs
GET    /api/jobs/:id             → Get job details
DELETE /api/jobs/:id             → Delete saved job
```

## Application Routes

```
POST   /api/applications         → Create application
GET    /api/applications         → List applications (with filters)
GET    /api/applications/:id     → Get application details
PUT    /api/applications/:id     → Update application (status, notes)
DELETE /api/applications/:id     → Delete application
GET    /api/applications/stats   → Pipeline statistics
```

## Cover Letter Routes

```
POST   /api/cover-letters        → Generate cover letter
GET    /api/cover-letters        → List cover letters
GET    /api/cover-letters/:id    → Get cover letter
PUT    /api/cover-letters/:id    → Edit cover letter
DELETE /api/cover-letters/:id    → Delete cover letter
```

## Interview Routes

```
POST   /api/interviews/start     → Start interview session
POST   /api/interviews/:id/answer → Submit answer (text or audio)
GET    /api/interviews/:id       → Get session with feedback
GET    /api/interviews           → List past sessions
POST   /api/interviews/:id/tts   → Generate TTS for question
```

## Salary Routes

```
POST   /api/salary/research      → Research salary for role
GET    /api/salary               → List past research
GET    /api/salary/:id           → Get research details
```

## LinkedIn Routes

```
POST   /api/linkedin/sync        → Sync LinkedIn profile
GET    /api/linkedin/alignment   → Get alignment analysis
POST   /api/linkedin/apply-fix   → Apply suggested fix
```

## User Routes

```
GET    /api/user/profile         → Get profile
PUT    /api/user/profile         → Update profile
GET    /api/user/preferences     → Get preferences
PUT    /api/user/preferences     → Update preferences
GET    /api/user/export          → Export all data (GDPR)
POST   /api/user/delete          → Schedule account deletion
POST   /api/user/consent         → Update consent
```

## Theme Routes

```
GET    /api/themes               → List available themes
GET    /api/themes/:id           → Get theme details
POST   /api/themes/:id/apply     → Apply theme to user
GET    /api/user/themes          → Get user's purchased themes
POST   /api/themes/:id/purchase  → Purchase theme
```

## Employer Routes

```
POST   /api/employer/vacancies              → Create vacancy
GET    /api/employer/vacancies              → List vacancies
GET    /api/employer/vacancies/:id          → Get vacancy
PUT    /api/employer/vacancies/:id          → Update vacancy
DELETE /api/employer/vacancies/:id          → Close vacancy

POST   /api/employer/vacancies/:id/screen   → Bulk screen resumes
GET    /api/employer/vacancies/:id/candidates → List candidates
PUT    /api/employer/candidates/:id         → Update candidate status
POST   /api/employer/candidates/compare     → Compare candidates

POST   /api/employer/rubrics                → Create rubric
GET    /api/employer/rubrics                → List rubrics
PUT    /api/employer/rubrics/:id            → Update rubric

POST   /api/employer/emails/send            → Send email
GET    /api/employer/emails                 → Email log
POST   /api/employer/emails/templates       → Create template
GET    /api/employer/emails/templates       → List templates
PUT    /api/employer/emails/templates/:id   → Update template

GET    /api/employer/analytics              → Hiring analytics
```

## Payment Routes

```
POST   /api/stripe/checkout      → Create checkout session
POST   /api/stripe/webhook       → Stripe webhook handler
GET    /api/stripe/subscription  → Get subscription status
POST   /api/stripe/cancel        → Cancel subscription
POST   /api/stripe/portal        → Customer portal link
```

## Referral Routes

```
POST   /api/referrals            → Create referral
GET    /api/referrals            → List user's referrals
GET    /api/referrals/code       → Get referral code
POST   /api/referrals/redeem     → Redeem referral code
```

## System Routes

```
GET    /api/health               → Health check (public)
GET    /api/status               → System status (public)
POST   /api/support              → Submit support ticket
POST   /api/feedback             → Submit feedback
```

---

## Response Format

```json
// Success
{
  "ok": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}

// Error
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  }
}
```

## Error Codes

```
400  VALIDATION_ERROR       → Invalid input
401  UNAUTHORIZED           → Not logged in
403  FORBIDDEN              → No permission
404  NOT_FOUND              → Resource doesn't exist
409  CONFLICT               → Duplicate resource
413  PAYLOAD_TOO_LARGE      → File too big
429  RATE_LIMITED           → Too many requests
500  INTERNAL_ERROR         → Server error
503  SERVICE_UNAVAILABLE    → AI service down
```
