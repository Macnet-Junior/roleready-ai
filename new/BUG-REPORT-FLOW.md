# RoleReady — Bug Report Flow

## How Users Report Bugs

### In-App (Settings → Help → Report a Bug)

```
Form fields:
1. What happened? (required, textarea)
2. What did you expect? (required, textarea)
3. Steps to reproduce (optional, textarea)
4. Screenshot (optional, file upload)
5. Your email (auto-filled)

On submit:
- Creates support ticket in database
- Sends confirmation email to user
- Notifies team via Slack webhook
- Includes: browser, OS, screen size, user ID, route
```

### Email

```
support@roleready.ai → creates ticket automatically
```

## Bug Severity

| Level | Definition | Response | Fix |
|-------|-----------|----------|-----|
| **Critical** | Site down, data loss, security | 1 hour | Same day |
| **High** | Major feature broken | 4 hours | 24 hours |
| **Medium** | Feature partially broken | 24 hours | 1 week |
| **Low** | Cosmetic, minor inconvenience | 48 hours | 2 weeks |

## Bug Template (Internal)

```markdown
## Bug Report

**Severity:** Critical / High / Medium / Low
**Reporter:** [name or auto]
**Date:** [date]
**Environment:** Production / Staging / Dev

### What happened
[Description]

### Expected behavior
[What should happen]

### Steps to reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Screenshots / Logs
[Attach]

### Root cause
[After investigation]

### Fix
[After fix]
```

## Auto-Capture

``On error, automatically capture:``

```javascript
{
  error: error.message,
  stack: error.stack,
  route: window.location.pathname,
  userId: user?.id,
  browser: navigator.userAgent,
  screen: `${window.innerWidth}x${window.innerHeight}`,
  timestamp: new Date().toISOString(),
  lastActions: getRecentActions(5) // last 5 user actions
}
```