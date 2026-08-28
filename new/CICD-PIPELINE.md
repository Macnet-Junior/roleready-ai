# RoleReady — CI/CD Pipeline

## Overview

Vercel for frontend. GitHub Actions for backend tasks.

---

## Deploy Flow

```
Push to main → Vercel auto-deploys
Push to staging → Vercel preview deploy
PR created → Vercel preview URL + Lighthouse CI
```

## GitHub Actions

### On Every PR

```yaml
# .github/workflows/pr-check.yml
name: PR Check
on: pull_request
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: pull_request
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://$PREVIEW_URL/
            https://$PREVIEW_URL/dashboard
          budgetPath: ./lighthouse-budget.json
```

### Dependency Audit

```yaml
# .github/workflows/audit.yml
name: Security Audit
on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday 9am
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - run: npx better-npm-audit audit
```

## Environment Variables

```
Vercel:
  - Production: real API keys
  - Preview: test API keys
  - Development: local .env.local

GitHub Secrets:
  - VERCEL_TOKEN
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID
  - SUPABASE_URL (test)
  - SUPABASE_ANON_KEY (test)
```

## Rollback

```
Vercel: Dashboard → Deployments → click "Promote" on previous version
Database: Supabase → Backups → Restore
API keys: Rotate in Vercel env vars
```