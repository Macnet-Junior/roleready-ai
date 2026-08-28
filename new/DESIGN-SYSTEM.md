# RoleReady Design System v2.0

## Brand Identity

### Logo
- **Icon**: Shield + Checkmark + Arrow (readiness + career growth)
- **Wordmark**: "RoleReady" — Poppins Bold
- **Tagline**: "From Application to Offer — Confidently"

### Color Palette

#### Primary
- **Deep Navy**: #0A1628 (backgrounds, headers)
- **Electric Blue**: #2563EB (primary actions, CTAs)
- **Sky Blue**: #3B82F6 (secondary actions, highlights)

#### Secondary
- **Emerald**: #10B981 (success, match scores, positive indicators)
- **Amber**: #F59E0B (warnings, pending states)
- **Rose**: #F43F5E (errors, rejection, urgent)
- **Violet**: #8B5CF6 (premium, enterprise features)

#### Neutrals
- **White**: #FFFFFF
- **Gray 50**: #F8FAFC
- **Gray 100**: #F1F5F9
- **Gray 200**: #E2E8F0
- **Gray 300**: #CBD5E1
- **Gray 500**: #64748B
- **Gray 700**: #334155
- **Gray 900**: #0F172A

### Typography
- **Headings**: Poppins (Bold 700, SemiBold 600)
- **Body**: Inter (Regular 400, Medium 500)
- **Mono/Code**: JetBrains Mono (for scores, data)

### Spacing Scale
- 4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 12px (cards)
- Large: 16px (modals, panels)
- Full: 9999px (pills, avatars)

### Shadows
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.07)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.15)

## Navigation Architecture

### Candidate Mode — Bottom Tab Bar (Mobile) / Sidebar (Web)
1. **Home** (Dashboard) — Overview, quick actions, recent activity
2. **Prepare** — Resume, Resume Studio, Cover Letter
3. **Apply** — Job Match, Application Tracker, Outreach
4. **Interview** — STAR Practice, Mock Interview, Feedback
5. **Profile** — Settings, History, Subscription, Help

### Employer Mode — Top Tab Bar (Mobile) / Sidebar (Web)
1. **Dashboard** — Active vacancies, pipeline overview, metrics
2. **Vacancies** — Create/manage job requisitions
3. **Candidates** — Bulk screening, comparison, shortlist
4. **Communications** — Email templates, scheduling, sent log
5. **Settings** — Team, rubrics, integrations, billing

## Component Library

### Buttons
- **Primary**: Electric Blue bg, white text, 8px radius, 48px height
- **Secondary**: White bg, Electric Blue border, Electric Blue text
- **Ghost**: Transparent bg, Gray 700 text
- **Danger**: Rose bg, white text

### Cards
- White bg, 12px radius, md shadow, 24px padding
- Hover: lg shadow, 2px translateY

### Input Fields
- White bg, Gray 300 border, 8px radius, 48px height
- Focus: Electric Blue border, subtle glow
- Error: Rose border

### Score Display
- Circular progress ring (Emerald for high, Amber for medium, Rose for low)
- Large number in center
- Label below

### Navigation Bar
- Deep Navy bg for web sidebar
- White bg with shadow for mobile bottom bar
- Active state: Electric Blue icon + label
- Inactive: Gray 500 icon + label
