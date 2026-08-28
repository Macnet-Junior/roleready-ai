# RoleReady — Complete Product Roadmap

## Product Vision

> **RoleReady is the career operating system that takes candidates from job description to offer — and helps employers screen candidates faster with explainable, evidence-based recommendations while keeping humans in control.**

---

## Phase 1: Foundation & Trust (Months 1–3)

### Goal: Make the existing product trustworthy and polished

#### 1.1 Design System & Brand Refresh
- [x] New logo (shield + checkmark + growth arrow)
- [x] Color palette: Deep Navy, Electric Blue, Emerald, Violet
- [x] Typography: Poppins (headings) + Inter (body) + JetBrains Mono (data)
- [x] Component library (buttons, cards, inputs, navigation)
- [x] Mobile-first responsive layouts
- [ ] Dark mode support
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Animation & micro-interaction system

#### 1.2 Core Resume Features
- [ ] Resume upload (PDF, DOCX, LinkedIn import)
- [ ] AI resume parsing and data extraction
- [ ] Resume scoring against job descriptions
- [ ] **Transparent match scoring** — show evidence, not just numbers
- [ ] **Truth protection system** — flag unverified claims
- [ ] Resume version history with diff view
- [ ] Before/after comparison
- [ ] Accept/reject individual AI suggestions
- [ ] Export to PDF/DOCX

#### 1.3 Navigation Restructure
- [ ] **Candidate Mode**: Home → Prepare → Apply → Interview → Profile
- [ ] **Employer Mode**: Dashboard → Vacancies → Candidates → Communications → Settings
- [ ] Mode switcher in sidebar
- [ ] Mobile bottom tab bar (5 tabs)
- [ ] Breadcrumb navigation for deep screens

#### 1.4 Mobile Optimization
- [ ] Responsive breakpoints (320px, 375px, 390px, 414px, 768px)
- [ ] Touch-optimized tap targets (min 44px)
- [ ] Swipe gestures for actions
- [ ] Pull-to-refresh
- [ ] Bottom sheet modals
- [ ] Safe area handling (notch, home indicator)
- [ ] Offline support for viewed data

#### 1.5 Privacy & Security
- [ ] Privacy policy page
- [ ] Terms of service
- [ ] Data retention settings
- [ ] Export all data
- [ ] Delete account
- [ ] Cookie consent
- [ ] GDPR compliance basics

---

## Phase 2: Job Search Workflow (Months 3–6)

### Goal: Turn RoleReady from a tool into a complete job-search workspace

#### 2.1 Job Matching
- [ ] Paste job URL → auto-extract requirements
- [ ] Upload job description PDF
- [ ] Browser extension for saving jobs (Chrome, Firefox)
- [ ] Auto-extract: skills, experience level, salary, deadline
- [ ] Match score with full evidence breakdown
- [ ] Skill gap analysis with learning recommendations
- [ ] Job priority ranking (not just score)

#### 2.2 Application Tracker
- [ ] Application CRUD (company, role, URL, date, status)
- [ ] Status pipeline: Saved → Applied → Screening → Interview → Offer → Hired/Rejected
- [ ] Link resume version to each application
- [ ] Link cover letter to each application
- [ ] Contact person management
- [ ] Follow-up reminders (email/push)
- [ ] Notes and outcome tracking
- [ ] Calendar integration for interviews
- [ ] Kanban board view
- [ ] List view with filters and sorting

#### 2.3 Cover Letter Generator
- [ ] Generate from job description + resume
- [ ] Voice/tone selection (Direct, Professional, Warm, Executive, Technical)
- [ ] Edit generated letter inline
- [ ] Version history
- [ ] Template library
- [ ] A/B test two versions

#### 2.4 LinkedIn Alignment
- [ ] LinkedIn profile import
- [ ] Headline consistency check
- [ ] Experience alignment
- [ ] Skills gap analysis
- [ ] Summary comparison
- [ ] Suggestions for alignment

---

## Phase 3: Interview Preparation (Months 6–9)

### Goal: Help candidates practice and improve, not just prepare

#### 3.1 STAR Method Practice
- [ ] Generate questions from job description
- [ ] Generate questions from resume
- [ ] Voice recording with transcription
- [ ] AI feedback on: clarity, evidence, structure, relevance
- [ ] Scoring rubric (1–5 per STAR component)
- [ ] Practice history with improvement tracking
- [ ] Follow-up question generation
- [ ] Competency-based question categories

#### 3.2 Mock Interview
- [ ] Full mock interview flow (intro → questions → closing)
- [ ] Voice-based interaction (TTS for questions, STT for answers)
- [ ] Real-time feedback panel
- [ ] Post-interview report
- [ ] Recording playback
- [ ] Interviewer persona selection (friendly, neutral, challenging)

#### 3.3 Interview Feedback
- [ ] Clarity score
- [ ] Evidence quality
- [ ] Structure assessment
- [ ] Confidence indicators
- [ ] Filler word detection
- [ ] Pace and timing analysis
- [ ] Comparison with best-practice answers

---

## Phase 4: Employer Product (Months 9–14)

### Goal: Build the enterprise hiring workspace

#### 4.1 Employer Mode
- [ ] Separate employer account
- [ ] Company profile setup
- [ ] Team roles and permissions (Admin, Recruiter, Viewer)
- [ ] SSO/SAML integration
- [ ] Billing per vacancy or platform

#### 4.2 Vacancy Management
- [ ] Create vacancy with job description
- [ ] Auto-extract requirements from JD
- [ ] Configurable scoring rubric
  - Essential / Preferred / Optional criteria
  - Weight percentages
  - Disqualifiers
- [ ] Vacancy templates
- [ ] Duplicate vacancy
- [ ] Archive/close vacancy

#### 4.3 Bulk Candidate Screening
- [ ] Upload up to 100 resumes (PDF/DOCX)
- [ ] CSV bulk import
- [ ] Auto-extract and standardize candidate data
- [ ] Score against configurable rubric
- [ ] Ranked candidate list with evidence
- [ ] Filter by score, skills, experience
- [ ] Search within candidates
- [ ] Duplicate detection

#### 4.4 Candidate Comparison
- [ ] Side-by-side comparison (2–4 candidates)
- [ ] Skills comparison matrix
- [ ] Experience timeline comparison
- [ ] Score breakdown comparison
- [ ] Notes and annotations

#### 4.5 Recruiter Approval Centre
- [ ] Shortlist / Maybe / Reject / Needs Clarification
- [ ] Bulk actions (approve selected, reject selected)
- [ ] Approval requires evidence review
- [ ] Decision audit trail
- [ ] Override AI recommendation with reason

#### 4.6 Email Automation
- [ ] Email templates (interview invite, rejection, follow-up)
- [ ] Customizable templates per company
- [ ] Send from company domain (verified)
- [ ] Edit before sending
- [ ] Schedule sending
- [ ] Cancel scheduled emails
- [ ] Delivery tracking
- [ ] **Rejection emails require explicit approval**

#### 4.7 Hiring Analytics
- [ ] Pipeline overview (sourced → screening → interview → offer → hired)
- [ ] Time-to-hire metrics
- [ ] Source effectiveness
- [ ] Candidate drop-off analysis
- [ ] Rubric effectiveness (which criteria predict success)
- [ ] Team activity log

---

## Phase 5: Enterprise & Integrations (Months 14–18)

### Goal: Become embedded in hiring workflows

#### 5.1 ATS Integrations
- [ ] Greenhouse
- [ ] Workable
- [ ] Lever
- [ ] Ashby
- [ ] SmartRecruiters
- [ ] BambooHR
- [ ] Workday
- [ ] CSV import/export

#### 5.2 Advanced Features
- [ ] Resume anonymization (blind screening)
- [ ] Bias monitoring reports
- [ ] Protected-attribute exclusion
- [ ] Candidate consent management
- [ ] Data retention policies per company
- [ ] Audit logs
- [ ] Exportable screening reports
- [ ] API access

#### 5.3 Enterprise Security
- [ ] SOC 2 compliance
- [ ] SSO/SAML
- [ ] Role-based access control
- [ ] Data encryption at rest
- [ ] IP allowlisting
- [ ] DPA (Data Processing Agreement)
- [ ] EU AI Act compliance documentation

---

## Phase 6: Differentiation & Intelligence (Months 18–24)

### Goal: Build proprietary value that AI alone cannot replicate

#### 6.1 Outcome Analytics
- [ ] Track which resume versions produce interviews
- [ ] Which rubric criteria correlate with hires
- [ ] Which strategies work for which industries
- [ ] Personalized recommendations based on outcomes

#### 6.2 Salary Intelligence
- [ ] Data from multiple sources (Glassdoor, Levels.fyi, Payscale)
- [ ] Location-adjusted ranges
- [ ] Seniority-level mapping
- [ ] Confidence intervals
- [ ] Negotiation scripts
- [ ] Total compensation calculator

#### 6.3 Career Path Intelligence
- [ ] Skills-based career path suggestions
- [ ] Industry transition analysis
- [ ] Learning recommendations
- [ ] Certification value analysis

---

## Pricing Strategy

### Candidate Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 resume analysis, basic match score, limited history |
| **Pro** | $15/month | Unlimited analyses, cover letters, STAR practice, application tracker |
| **Lifetime** | $99 | All Pro features, lifetime access |

### Employer Plans

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $299/month | 1 vacancy, up to 50 candidates, basic rubric, email templates |
| **Team** | $799/month | 5 vacancies, up to 200 candidates, team roles, analytics |
| **Enterprise** | Custom | Unlimited, ATS integration, SSO, compliance, dedicated support |

---

## Technical Architecture

### Frontend
- **Web**: React + Next.js + Tailwind CSS
- **Mobile**: React Native (iOS + Android) or responsive web
- **State**: Zustand or React Query
- **Charts**: Recharts or Visx

### Backend
- **API**: Node.js + Express or Fastify
- **Database**: PostgreSQL (primary) + Redis (caching)
- **Auth**: NextAuth.js or Clerk
- **File Storage**: S3-compatible (AWS S3, R2)
- **Queue**: BullMQ for async processing

### AI Pipeline
1. **OCR/Parser**: pdf-parse, mammoth (DOCX), LinkedIn API
2. **Embeddings**: OpenAI Ada or open-source (for matching)
3. **Classification**: GPT-4o-mini (cheap) for initial parsing
4. **Analysis**: GPT-4o or Claude (quality) for final scoring
5. **TTS**: ElevenLabs or OpenAI TTS (for interview practice)
6. **STT**: Whisper API (for voice recording)

### Infrastructure
- **Hosting**: Vercel (web) + Railway/Fly.io (API)
- **CDN**: Cloudflare
- **Monitoring**: Sentry + PostHog
- **Email**: Resend or SendGrid

---

## Success Metrics

### Candidate Product
- Resume score improvement (before → after)
- Application-to-interview conversion rate
- User retention (weekly active)
- NPS score
- Time spent per session

### Employer Product
- Time-to-shortlist (hours)
- Candidate throughput (per recruiter per week)
- Recruiter override rate (lower = better AI)
- Hire quality (90-day retention)
- Customer satisfaction (CSAT)

---

## Competitive Moat Summary

| What AI Alone Can't Do | RoleReady's Advantage |
|------------------------|----------------------|
| Track applications over time | Full job-search workspace |
| Remember your resume history | Version control with diffs |
| Provide structured rubrics | Configurable scoring system |
| Maintain audit trails | Decision logging |
| Send professional emails | Template + approval workflow |
| Integrate with ATS | Greenhouse, Workable, etc. |
| Ensure compliance | EU AI Act, NYC LL144 |
| Learn from outcomes | Proprietary feedback loop |
