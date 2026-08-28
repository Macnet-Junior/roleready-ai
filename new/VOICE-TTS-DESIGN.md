# RoleReady — Voice & TTS Design

## Voice Identity

RoleReady's voice should feel like a **trusted, encouraging career coach** — not a robot, not a cheerleader.

### Personality Traits
- **Confident** — speaks with authority about career advice
- **Warm** — encouraging without being patronizing
- **Clear** — no jargon, no filler, direct guidance
- **Professional** — appropriate for workplace context
- **Honest** — gives truthful feedback, even when it's hard

### Voice Settings

| Setting | Value | Use Case |
|---------|-------|----------|
| **Speed** | 1.0x (normal) | Default for all content |
| **Speed** | 0.85x (slow) | Complex instructions, rubric explanations |
| **Speed** | 1.15x (fast) | Quick confirmations, status updates |
| **Tone** | Neutral-warm | General guidance |
| **Tone** | Encouraging | Positive feedback, achievements |
| **Tone** | Direct | Truth protection warnings, gaps |
| **Tone** | Professional | Employer communications |

---

## TTS Use Cases

### 1. Interview Practice (STAR Method)

**Flow:**
1. System reads the interview question aloud
2. User records their answer (voice)
3. System transcribes the answer
4. System provides spoken feedback

**TTS Script Example:**
> "Tell me about a time you led a cross-functional team through a difficult product launch. Take your time, and try to use the STAR method: describe the Situation, your Task, the Action you took, and the Result."

**Feedback TTS:**
> "Good structure. You clearly described the situation and your role. To strengthen this, add a specific metric to your result — for example, how much revenue the launch generated, or how many users adopted the product in the first month."

### 2. Resume Analysis Summary

**TTS Script Example:**
> "Your resume scored 82 out of 100 for this role. Your strongest areas are keyword alignment at 88 percent and formatting at 92 percent. The biggest opportunity is in impact metrics — three of your bullet points describe responsibilities without measurable outcomes. I've flagged specific suggestions you can accept or edit."

### 3. Job Match Summary

**TTS Script Example:**
> "You're a 78 percent match for the Senior Product Manager role at Stripe. You match 14 of 18 required skills. The four gaps are SQL, A/B testing, Python, and Figma. Of these, SQL and A/B testing are marked as essential. I'd recommend addressing these before applying."

### 4. Application Status Updates

**TTS Script Example:**
> "Update on your application: Stripe has moved you to the interview stage. Your interview is scheduled for Thursday at 2 PM Pacific. I've added it to your calendar. Would you like to practice some likely interview questions?"

### 5. Truth Protection Alerts

**TTS Script Example:**
> "I found a claim that needs attention. Your resume says you increased revenue by 35 percent, but there's no supporting context or timeframe. In an interview, you may be asked to verify this. I'd recommend either adding specific numbers or replacing it with a non-numerical version."

### 6. Cover Letter Reading

**TTS Script Example:**
> "Here's your tailored cover letter for the Product Lead role at Notion. It emphasizes your 8 years of product experience, your track record in B2B SaaS, and your recent work on user onboarding — which directly matches their requirements. Would you like to hear it, or make edits first?"

### 7. Salary Strategy Briefing

**TTS Script Example:**
> "Based on market data from Glassdoor and Levels.fyi, the expected salary range for a Senior Product Manager in San Francisco is $180,000 to $220,000 base, with total compensation between $250,000 and $350,000. Your experience level puts you in the 65th percentile. I'd recommend targeting $200,000 base as your anchor."

---

## Sound Design

### UI Sound Effects

| Event | Sound | Duration |
|-------|-------|----------|
| **Success** (score, match, submit) | Soft chime, ascending | 0.3s |
| **Warning** (truth protection, gap) | Gentle alert tone | 0.4s |
| **Error** (failed upload, timeout) | Soft low tone | 0.3s |
| **Notification** (new match, reminder) | Light ping | 0.2s |
| **Button tap** | Subtle click | 0.1s |
| **Page transition** | Soft whoosh | 0.2s |
| **Recording start** | Rising tone | 0.3s |
| **Recording stop** | Falling tone | 0.3s |

### Sound Principles
- **Subtle** — sounds should enhance, not distract
- **Consistent** — same type of event = same sound family
- **Optional** — users can mute all sounds
- **Accessible** — sounds supplement visual cues, never replace them

---

## Voice Practice Feature — Detailed Design

### Recording Flow
1. Question displayed on screen + read aloud via TTS
2. "Tap to start recording" prompt
3. Recording indicator (red dot, timer)
4. User speaks their answer
5. Tap to stop (or auto-stop after 3 minutes)
6. Transcription appears on screen
7. AI analyzes and provides feedback

### Feedback Categories

| Category | Score | What It Measures |
|----------|-------|-----------------|
| **STAR Structure** | 1–5 | Did they follow Situation, Task, Action, Result? |
| **Clarity** | 1–5 | Was the answer easy to follow? |
| **Evidence** | 1–5 | Did they provide specific examples and metrics? |
| **Relevance** | 1–5 | Did it address the question asked? |
| **Conciseness** | 1–5 | Was it appropriately lengthed? |

### Feedback Delivery
- **Visual**: Score breakdown on screen
- **Text**: Detailed written feedback
- **Voice**: TTS summary of key points
- **Actionable**: Specific suggestions for improvement

### Practice Modes
1. **Quick Practice** — 1 question, instant feedback
2. **Full Mock** — 5–8 questions, comprehensive report
3. **Weak Areas** — Focus on lowest-scoring categories
4. **Job-Specific** — Questions tailored to target role
5. **Follow-Up** — Practice handling follow-up questions

---

## Employer TTS Use Cases

### 1. Candidate Summary Briefing

> "You have 23 candidates for the Senior Product Manager role. 8 are in screening, 4 have interviews scheduled. Sarah Johnson is your top match at 94 percent, with strong evidence in product strategy and team leadership. Would you like to review her evidence?"

### 2. Batch Screening Summary

> "Batch screening complete. Of 15 resumes analyzed, 4 candidates scored above 80 percent, 6 are between 60 and 80, and 5 are below 60. The top candidate, Michael Chen, matches 17 of 20 rubric criteria. All results are ready for your review."

### 3. Email Queue Status

> "You have 3 emails pending approval: 2 interview invitations and 1 rejection email. The rejection is for David Kim — his score was 62 percent, primarily due to missing essential technical skills. Would you like to review the email before it's sent?"
