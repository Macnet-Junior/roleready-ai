# RoleReady — Changelog

## Purpose

Build trust by showing users the product is actively improving.

---

## Format

```markdown
## [Version] — YYYY-MM-DD

### ✨ New Features
- Feature description

### 🐛 Bug Fixes
- Fix description

### 🔒 Security
- Security improvement

### 📦 Improvements
- Improvement description
```

## Where to Display

```
- /changelog page (public)
- In-app notification badge (when new)
- Email digest (monthly summary)
- Twitter thread (major releases)
```

## Example

```markdown
## v1.2.0 — 2026-09-15

### ✨ New Features
- **Application Tracker Kanban Board** — visualize your job 
  pipeline with drag-and-drop cards
- **Bulk Resume Screening** — employers can upload up to 100 
  resumes and get ranked candidates
- **Voice Interview Practice** — record answers and get AI 
  feedback on clarity, structure, and evidence

### 🐛 Bug Fixes
- Fixed resume parsing failing on DOCX files with images
- Fixed cover letter not saving when switching tabs
- Fixed mobile bottom nav overlapping content on iPhone SE

### 🔒 Security
- Added CAPTCHA on signup to prevent spam accounts
- Implemented rate limiting on all API endpoints
- Upgraded to TLS 1.3

### 📦 Improvements
- Resume analysis now 40% faster
- Added 3 new resume templates
- Improved mobile responsiveness on application tracker
```

## Version Numbering

```
Major.Minor.Patch
1.0.0 → 1.0.1 (patch: bug fix)
1.0.0 → 1.1.0 (minor: new feature)
1.0.0 → 2.0.0 (major: breaking change)
```