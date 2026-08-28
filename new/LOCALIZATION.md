# RoleReady — Localization (i18n)

## Strategy

Start with English only. Add languages based on user demand.

---

## Priority Languages (add when 1K+ users from region)

| Language | Region | Trigger |
|----------|--------|---------|
| Spanish | US, Latin America | 1K+ users |
| French | Canada, Europe | 1K+ users |
| German | DACH region | 500+ users |
| Portuguese | Brazil | 500+ users |
| Japanese | Japan | 500+ users |

## Implementation

```typescript
// Use next-intl (recommended for Next.js)
// npm install next-intl

// Structure:
/messages
  /en.json
  /es.json
  /fr.json

// Example en.json:
{
  "dashboard": {
    "greeting": "Good {timeOfDay}, {name}",
    "resumeScore": "Resume Score",
    "applications": "Applications",
    "interviews": "Interview Invites",
    "avgMatch": "Avg Match Score"
  },
  "resume": {
    "upload": "Upload your resume",
    "analyzing": "Analyzing your resume...",
    "score": "{score} out of 100",
    "matchedSkills": "Matched Skills ({count})",
    "missingSkills": "Missing Skills ({count})"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "notFound": "Page not found",
    "unauthorized": "Please log in to continue"
  }
}
```

## What to Localize

```
✅ UI text (buttons, labels, headings)
✅ Error messages
✅ Email templates
✅ Onboarding flow
✅ Help content
✅ Legal pages (with legal review)

❌ User-generated content (resumes, notes)
❌ AI-generated content (scores, suggestions)
❌ Technical terms (ATS, STAR method)
❌ Brand name (RoleReady)
```

## Date/Time/Currency

```typescript
// Use Intl built-in APIs
const formatDate = (date: Date, locale: string) => 
  new Intl.DateTimeFormat(locale, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(date);

const formatCurrency = (amount: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { 
    style: 'currency', currency 
  }).format(amount);

// Examples:
// en-US: $210,000 · August 27, 2026
// de-DE: 210.000 $ · 27. August 2026
// es-MX: $210,000 · 27 de agosto de 2026
```

## RTL Support (future)

```
For Arabic, Hebrew, Persian:
- Add dir="rtl" to <html>
- Mirror all layouts (sidebar on right)
- Flip icons (arrows, chevrons)
- Use CSS logical properties (margin-inline-start instead of margin-left)
```