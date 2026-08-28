# RoleReady — Status Page

## Purpose

Transparent communication during outages and incidents.

---

## URL

```
status.roleready.ai
```

## Service

```
Use: BetterUptime (free tier available)
Alternative: Instatus, Atlassian Statuspage
```

## Monitors

| Service | Check | Interval | Alert |
|---------|-------|----------|-------|
| Website | HTTP 200 | 1 min | Slack + Email |
| API | HTTP 200 /api/health | 1 min | Slack + Email |
| Database | Supabase health | 5 min | Slack |
| AI Service | OpenAI/Gemini status | 5 min | Slack |
| Email | Resend status | 5 min | Slack |
| Payments | Stripe status | 5 min | Slack |

## Status Levels

```
🟢 Operational — All systems working
🟡 Degraded Performance — Slower than usual
🟠 Partial Outage — Some features affected
🔴 Major Outage — Service unavailable
🔵 Maintenance — Scheduled downtime
```

## Incident Communication Template

```
Title: [Service] — [Status]
Status: Investigating / Identified / Monitoring / Resolved

[Time] — Investigating
We're aware of issues with [service]. Our team is investigating.
Impact: [what's affected]

[Time] — Identified
The issue has been identified as [cause]. We're working on a fix.
Impact: [what's affected]

[Time] — Monitoring
A fix has been deployed. We're monitoring for stability.
Impact: [what's affected]

[Time] — Resolved
The issue has been resolved. [Brief root cause].
Duration: [total time]
```

## Uptime Target

```
99.9% uptime = max 43 minutes downtime/month
99.95% uptime = max 22 minutes downtime/month
```