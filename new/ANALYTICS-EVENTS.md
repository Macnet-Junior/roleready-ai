# RoleReady — Analytics Events

## Overview

Track user behavior to improve the product. Use PostHog. All events are anonymous until user consents.

---

## Event Naming Convention

```
{category}_{action}_{object}

Examples:
auth_signup_completed
resume_uploaded_success
job_match_analyzed
application_created
```

## Auth Events

| Event | Properties | When |
|-------|-----------|------|
| `auth_signup_started` | `method: google/email/linkedin` | User clicks signup |
| `auth_signup_completed` | `method, plan` | Account created |
| `auth_login_completed` | `method` | Login success |
| `auth_login_failed` | `method, reason` | Login failure |
| `auth_password_reset_requested` | — | Reset email sent |
| `auth_logout` | — | User logs out |
| `auth_onboarding_started` | — | Onboarding begins |
| `auth_onboarding_step` | `step: 1-4, action: next/skip` | Each step |
| `auth_onboarding_completed` | `steps_completed` | Onboarding done |
| `auth_onboarding_abandoned` | `last_step` | User drops off |

## Resume Events

| Event | Properties | When |
|-------|-----------|------|
| `resume_uploaded` | `file_type, file_size` | Upload success |
| `resume_upload_failed` | `file_type, error` | Upload failure |
| `resume_analyzed` | `score, job_title, company` | Analysis complete |
| `resume_analysis_failed` | `error` | Analysis failure |
| `resume_edited` | `section` | User edits resume |
| `resume_exported` | `format: pdf/docx` | Export action |
| `resume_version_created` | `version_number` | New version saved |

## Job Match Events

| Event | Properties | When |
|-------|-----------|------|
| `job_match_started` | `source: url/paste/pdf` | Match initiated |
| `job_match_completed` | `score, matched_skills, missing_skills` | Match done |
| `job_match_failed` | `error, source` | Match failure |
| `job_saved` | `company, title, score` | Job saved to tracker |
| `job_url_pasted` | `domain` | URL entered |

## Application Events

| Event | Properties | When |
|-------|-----------|------|
| `application_created` | `company, title, source` | Application added |
| `application_status_changed` | `from_status, to_status` | Status update |
| `application_deleted` | `company, status` | Application removed |
| `application_note_added` | — | Note added |
| `application_exported` | `format: csv` | Export action |

## Cover Letter Events

| Event | Properties | When |
|-------|-----------|------|
| `cover_letter_generated` | `tone, job_title, company` | Generation complete |
| `cover_letter_edited` | — | User edits |
| `cover_letter_exported` | `format` | Export action |
| `cover_letter_generation_failed` | `error` | Generation failure |

## Interview Events

| Event | Properties | When |
|-------|-----------|------|
| `interview_practice_started` | `mode: quick/job/weak/full` | Session starts |
| `interview_question_answered` | `category, star_score, duration` | Answer submitted |
| `interview_session_completed` | `questions, avg_score, duration` | Session ends |
| `interview_recording_started` | — | Recording begins |
| `interview_recording_stopped` | `duration` | Recording ends |
| `interview_feedback_viewed` | — | Feedback displayed |

## Salary Events

| Event | Properties | When |
|-------|-----------|------|
| `salary_research_started` | `role, location` | Research initiated |
| `salary_research_completed` | `median, confidence, data_points` | Research done |
| `salary_script_copied` | `scenario` | Script copied |

## Employer Events

| Event | Properties | When |
|-------|-----------|------|
| `vacancy_created` | `title, company` | Vacancy created |
| `vacancy_closed` | `title, candidates_count` | Vacancy closed |
| `bulk_screening_started` | `resume_count` | Screening begins |
| `bulk_screening_completed` | `resume_count, avg_score, duration` | Screening done |
| `candidate_shortlisted` | `candidate_id, score` | Shortlist action |
| `candidate_rejected` | `candidate_id, score, reason` | Reject action |
| `email_sent` | `template_type, recipient` | Email sent |
| `rubric_created` | `criteria_count` | Rubric created |
| `rubric_updated` | `criteria_count` | Rubric updated |

## Payment Events

| Event | Properties | When |
|-------|-----------|------|
| `payment_checkout_started` | `plan, price` | Checkout initiated |
| `payment_completed` | `plan, price, method` | Payment success |
| `payment_failed` | `plan, error` | Payment failure |
| `subscription_cancelled` | `plan, reason` | Cancellation |
| `subscription_renewed` | `plan` | Renewal |

## Theme Events

| Event | Properties | When |
|-------|-----------|------|
| `theme_applied` | `theme_id, theme_name` | Theme changed |
| `theme_purchased` | `theme_id, price` | Theme bought |
| `theme_previewed` | `theme_id` | Preview opened |

## LinkedIn Events

| Event | Properties | When |
|-------|-----------|------|
| `linkedin_sync_completed` | `alignment_score` | Sync done |
| `linkedin_fix_applied` | `fix_type` | Fix applied |

## Referral Events

| Event | Properties | When |
|-------|-----------|------|
| `referral_code_generated` | — | Code created |
| `referral_invited` | `method: email/link` | Invite sent |
| `referral_converted` | — | Referred user signed up |
| `referral_rewarded` | `reward_type` | Reward given |

## Error Events

| Event | Properties | When |
|-------|-----------|------|
| `error_occurred` | `code, severity, route` | Any error |
| `error_boundary_triggered` | `component, error` | React error boundary |

## Engagement Events

| Event | Properties | When |
|-------|-----------|------|
| `page_viewed` | `page, referrer` | Page load |
| `feature_used` | `feature_name` | Any feature |
| `feedback_submitted` | `type: bug/feature/other` | Feedback form |
| `support_ticket_created` | `category` | Support request |

---

## Metrics to Track

```
Activation:  signup → first resume analysis (target: < 5 min)
Engagement:  weekly active users / total users (target: > 40%)
Retention:   users returning after 7 days (target: > 30%)
Conversion:  free → paid (target: > 5%)
NPS:         quarterly survey (target: > 50)
Time to Value: signup → first job match (target: < 10 min)
```
