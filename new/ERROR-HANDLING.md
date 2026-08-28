# RoleReady — Error Handling Guide

## Principle: Users should never see a raw error

Every error gets a user-friendly message, an action, and a way to recover.

---

## Error Response Structure

```typescript
interface AppError {
  code: string;           // Machine-readable: "RESUME_PARSE_FAILED"
  message: string;        // User-friendly: "We couldn't read your resume"
  action: string;         // What to do: "Try uploading a different file"
  supportId?: string;     // For contacting support: "ERR-abc123"
  retryable: boolean;     // Can the user retry?
  severity: 'info' | 'warning' | 'error' | 'critical';
}
```

## Error Categories & Messages

### Auth Errors

| Code | User Message | Action |
|------|-------------|--------|
| `AUTH_INVALID_CREDENTIALS` | "Email or password is incorrect" | "Try again or reset your password" |
| `AUTH_EMAIL_NOT_VERIFIED` | "Please verify your email" | "Check your inbox or resend verification" |
| `AUTH_ACCOUNT_LOCKED` | "Account temporarily locked" | "Try again in 30 minutes or reset password" |
| `AUTH_SESSION_EXPIRED` | "Your session has expired" | "Please log in again" |
| `AUTH_OAUTH_FAILED` | "Couldn't sign in with Google" | "Try again or use email login" |
| `AUTH_WEAK_PASSWORD` | "Password is too weak" | "Use at least 12 characters with a mix of types" |

### Resume Errors

| Code | User Message | Action |
|------|-------------|--------|
| `RESUME_UPLOAD_FAILED` | "Couldn't upload your file" | "Check your connection and try again" |
| `RESUME_PARSE_FAILED` | "We couldn't read this file" | "Try a different format (PDF or DOCX recommended)" |
| `RESUME_TOO_LARGE` | "File is too large" | "Maximum size is 10MB. Try compressing the file." |
| `RESUME_INVALID_TYPE` | "File type not supported" | "Please upload a PDF, DOCX, or TXT file" |
| `RESUME_EMPTY` | "The file appears to be empty" | "Check the file and try uploading again" |
| `RESUME_CORRUPTED` | "The file appears to be damaged" | "Try re-downloading or using a different file" |

### AI Errors

| Code | User Message | Action |
|------|-------------|--------|
| `AI_ANALYSIS_FAILED` | "Analysis couldn't be completed" | "Try again in a few moments" |
| `AI_RATE_LIMITED` | "You've reached your daily limit" | "Upgrade to Pro for more analyses" |
| `AI_SERVICE_UNAVAILABLE` | "AI service is temporarily unavailable" | "Try again in 5 minutes" |
| `AI_QUOTA_EXCEEDED` | "Monthly limit reached" | "Upgrade to Pro or wait for reset" |
| `AI_PROMPT_BLOCKED` | "Content couldn't be processed" | "Review your input and try again" |
| `AI_TIMEOUT` | "Analysis is taking longer than expected" | "Try again — shorter content processes faster" |

### Job Match Errors

| Code | User Message | Action |
|------|-------------|--------|
| `JOB_URL_INVALID` | "We couldn't access this job URL" | "Try pasting the job description directly" |
| `JOB_URL_BLOCKED` | "This site blocks automated access" | "Copy the job description and paste it instead" |
| `JOB_PARSE_FAILED` | "We couldn't extract job details" | "Paste the description manually" |
| `JOB_ALREADY_SAVED` | "You've already saved this job" | "View it in your Application Tracker" |

### Payment Errors

| Code | User Message | Action |
|------|-------------|--------|
| `PAYMENT_FAILED` | "Payment couldn't be processed" | "Check your card details and try again" |
| `PAYMENT_CARD_DECLINED` | "Your card was declined" | "Try a different card or contact your bank" |
| `PAYMENT_ALREADY_SUBSCRIBED` | "You already have an active subscription" | "Manage your subscription in Settings" |
| `PAYMENT_WEBHOOK_FAILED` | — (internal only) | "Contact support if payment went through" |

### Employer Errors

| Code | User Message | Action |
|------|-------------|--------|
| `VACANCY_LIMIT_REACHED` | "Vacancy limit reached" | "Upgrade your plan or close an existing vacancy" |
| `SCREENING_FAILED` | "Screening couldn't be completed" | "Try uploading fewer files at once" |
| `EMAIL_SEND_FAILED` | "Email couldn't be sent" | "Check the recipient address and try again" |
| `EMAIL_REQUIRES_APPROVAL` | "This email needs your approval first" | "Review and approve in Communications" |
| `CANDIDATE_ALREADY_PROCESSED` | "This candidate has already been reviewed" | "View their status in the candidate list" |

### File Errors

| Code | User Message | Action |
|------|-------------|--------|
| `FILE_UPLOAD_FAILED` | "Upload failed" | "Check your connection and try again" |
| `FILE_TOO_LARGE` | "File exceeds 10MB limit" | "Compress the file or use a smaller one" |
| `FILE_VIRUS_DETECTED` | "File flagged as potentially unsafe" | "Scan your device and try a different file" |
| `EXPORT_FAILED` | "Export couldn't be generated" | "Try again or contact support" |

---

## Error UI Components

### Toast (non-blocking)
```
For: Success messages, minor warnings
Position: Top-right
Duration: 4 seconds (auto-dismiss)
Example: "Resume saved successfully"
```

### Banner (inline)
```
For: Form validation, field-level errors
Position: Above the relevant section
Example: "Email is required" above email field
```

### Modal (blocking)
```
For: Critical errors requiring action
Position: Center screen
Example: "Session expired. Please log in again."
Actions: [Log In] [Cancel]
```

### Full Page Error
```
For: 404, 500, service outage
Position: Full page replacement
Example: "Something went wrong"
Actions: [Try Again] [Go Home] [Contact Support]
```

### Empty State
```
For: No data yet, empty lists
Position: Where content would be
Example: "No applications yet — start by matching to a job"
Actions: [Match to Job] [Upload Resume]
```

---

## Error Recovery Flows

### Resume Upload Failure
```
1. Show toast: "Upload failed — {reason}"
2. Keep upload zone visible
3. Show "Try Again" button
4. Offer alternative: "Paste resume text instead"
5. If repeated failure: "Contact Support" link with error ID
```

### AI Analysis Failure
```
1. Show banner: "Analysis couldn't be completed"
2. Check: Was it timeout? Rate limit? Service down?
3. If timeout → "Try with a shorter resume"
4. If rate limit → "Daily limit reached. Upgrade or wait."
5. If service down → "AI service temporarily unavailable"
6. Auto-retry once after 10 seconds
7. If still failing → "Contact Support" with support ID
```

### Payment Failure
```
1. Show modal: "Payment couldn't be processed"
2. Don't charge again automatically
3. Show: "Check your card details"
4. Offer: "Try a different card"
5. Offer: "Contact your bank"
6. If Stripe error → surface Stripe's user-friendly message
7. Log for support team
```

---

## Error Logging

```typescript
function logError(error: AppError, context: {
  userId?: string;
  route: string;
  method: string;
  userAgent?: string;
  ip?: string;
}) {
  // Log to Sentry
  Sentry.captureException(error, {
    tags: {
      code: error.code,
      severity: error.severity,
      route: context.route
    },
    user: {
      id: context.userId
    }
  });
  
  // Log to database (for analytics)
  if (error.severity === 'critical' || error.severity === 'error') {
    await supabase.from('error_logs').insert({
      code: error.code,
      message: error.message,
      route: context.route,
      user_id: context.userId,
      support_id: error.supportId
    });
  }
}
```