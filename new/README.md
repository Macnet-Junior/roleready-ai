# RoleReady — Design Package

## 📁 Contents

### Design System
- `DESIGN-SYSTEM.md` — Colors, typography, spacing, components, navigation architecture
- `VOICE-TTS-DESIGN.md` — Voice identity, TTS scripts, sound design, voice practice feature

### Logo
- `assets/logo.svg` — Shield + checkmark + growth arrow (SVG vector)

### Screen Mockups (Web)
- `screens/01-welcome.html` — Welcome/Login screen
- `screens/02-onboarding-goals.html` — Onboarding: Goal selection
- `screens/03-candidate-dashboard.html` — Candidate dashboard (full web)
- `screens/04-employer-dashboard.html` — Employer dashboard (full web)
- `screens/05-resume-analysis.html` — Resume analysis with truth protection
- `screens/06-onboarding-role.html` — Onboarding: Role selection (Candidate vs Employer)

### Mobile Mockups
- `mobile/01-mobile-dashboard.html` — Mobile candidate dashboard (390px)

### Roadmap
- `ROADMAP.md` — Complete 24-month product roadmap with pricing, tech architecture, and success metrics

---

## 🎨 Design Highlights

### New Brand Identity
- **Logo**: Shield (trust) + Checkmark (readiness) + Upward arrow (career growth)
- **Colors**: Deep Navy (#0A1628) + Electric Blue (#2563EB) + Emerald (#10B981) + Violet (#8B5CF6)
- **Typography**: Poppins (headings) + Inter (body) + JetBrains Mono (data/scores)

### Navigation Restructure
**Candidate Mode** (Bottom tab bar on mobile / Sidebar on web):
1. Home (Dashboard)
2. Prepare (Resume, Studio, Cover Letters)
3. Apply (Job Match, Tracker, Outreach)
4. Interview (STAR Practice, Mock, Feedback)
5. Profile (Settings, History, Help)

**Employer Mode** (Top tab bar on mobile / Sidebar on web):
1. Dashboard (Pipeline overview)
2. Vacancies (Create/manage)
3. Candidates (Screening, comparison)
4. Communications (Email templates)
5. Settings (Team, rubrics, integrations)

### Key Design Decisions
1. **Removed AI model selector** from main interface — replaced with Fast/Balanced/Deep
2. **Truth protection system** — flags unverified claims with evidence
3. **Transparent scoring** — shows matched/missing skills, not just a number
4. **Recruiter approval required** — AI recommends, humans decide
5. **Separate Candidate/Employer modes** — clean separation of concerns
6. **Mobile-first** — responsive from 320px to 1440px+

---

## 🗺️ Roadmap Summary

| Phase | Timeline | Focus |
|-------|----------|-------|
| **1** | Months 1–3 | Foundation: Design system, resume features, mobile optimization |
| **2** | Months 3–6 | Job search: Matching, tracker, cover letters, LinkedIn |
| **3** | Months 6–9 | Interview: STAR practice, mock interviews, voice feedback |
| **4** | Months 9–14 | Employer: Bulk screening, rubrics, approval workflow, email |
| **5** | Months 14–18 | Enterprise: ATS integrations, compliance, security |
| **6** | Months 18–24 | Intelligence: Outcome analytics, salary data, career paths |

---

## 🏁 How to View

Open any `.html` file in a browser to see the interactive mockup. All screens are self-contained with inline CSS — no build step required.

For mobile views, use browser dev tools (F12) and set viewport to 390px width.
