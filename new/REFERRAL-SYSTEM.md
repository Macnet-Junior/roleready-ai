# RoleReady — Referral System

## How It Works

```
1. User gets unique referral code (Settings → Referrals)
2. Shares link: roleready.ai/ref/ABC123
3. Friend signs up → both get rewarded
4. Reward: 1 month free Pro for referrer, 1 month free for referred
```

## Rules

```
- Referrer must have active account (free or paid)
- Referred user must be new (no existing account)
- Referred user must complete onboarding (not just signup)
- Reward given after referred user's first 7 days
- Max 10 referrals per month (prevent abuse)
- Self-referral blocked (same IP, same device)
```

## Referral Link

```
Format: roleready.ai/ref/{code}
Example: roleready.ai/ref/mac2026

Code generation:
- 6-8 characters, alphanumeric
- Option to customize (if available)
- Case-insensitive
```

## Reward Structure

| Referrer Plan | Referred Signs Up | Referred Upgrades | Referrer Gets |
|--------------|-------------------|-------------------|---------------|
| Free | Free | — | 1 month Pro |
| Free | Free | Pro | 1 month Pro |
| Pro | Free | — | 1 month free |
| Pro | Free | Pro | 1 month free |

## UI Components

### Referral Page (Settings → Referrals)

```
- Your referral code (copy button)
- Your referral link (copy button)
- Share buttons (Twitter, LinkedIn, WhatsApp, Email)
- Referral stats: invited, signed up, converted
- Referral history table
- Reward status
```

### Referral Banner (Dashboard)

```
"Invite a friend, get 1 month free Pro"
[Copy Link] [Share]
```

### Post-Signup (Referred User)

```
"You were invited by [Name]! You both get 1 month free Pro."
```

## Anti-Abuse

```
- Block same-IP referrals
- Block same-device referrals
- Block disposable email domains
- Rate limit: max 10 invites/day
- Require email verification before reward
- Flag accounts with > 5 referrals for review
```