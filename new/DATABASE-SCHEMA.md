# RoleReady — Database Schema

## Overview

PostgreSQL via Supabase. All tables use UUID primary keys. RLS enabled on every table.

---

## Core Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  linkedin_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime', 'employer_starter', 'employer_team', 'enterprise')),
  plan_expires_at TIMESTAMPTZ,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'employer', 'admin')),
  consent_analytics BOOLEAN DEFAULT false,
  consent_ai_training BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deletion_scheduled TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: users can only read/update their own row
```

### resumes
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'txt')),
  raw_text TEXT,
  parsed_data JSONB,
  version INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### resume_versions
```sql
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  diff_from_previous JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: via resume_id → user_id
```

### resume_analyses
```sql
CREATE TABLE resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_url TEXT,
  job_title TEXT,
  company_name TEXT,
  job_description TEXT,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  keyword_score INTEGER,
  experience_score INTEGER,
  formatting_score INTEGER,
  skills_score INTEGER,
  impact_score INTEGER,
  matched_skills TEXT[],
  missing_skills TEXT[],
  transferable_skills JSONB,
  findings JSONB,
  suggestions JSONB,
  truth_flags JSONB,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote_type TEXT CHECK (remote_type IN ('remote', 'hybrid', 'onsite')),
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  extracted_requirements JSONB,
  extracted_skills TEXT[],
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### applications
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter_id UUID,
  status TEXT DEFAULT 'saved' CHECK (status IN (
    'saved', 'applied', 'screening', 'interview', 
    'offer', 'hired', 'rejected', 'withdrawn'
  )),
  match_score INTEGER,
  applied_at TIMESTAMPTZ,
  interview_date TIMESTAMPTZ,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### cover_letters
```sql
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tone TEXT DEFAULT 'professional',
  version INTEGER DEFAULT 1,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### interview_sessions
```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  mode TEXT CHECK (mode IN ('quick', 'job_specific', 'weak_areas', 'full_mock')),
  interviewer_style TEXT DEFAULT 'neutral',
  total_questions INTEGER,
  completed_questions INTEGER DEFAULT 0,
  overall_score NUMERIC(3,1),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### interview_answers
```sql
CREATE TABLE interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_category TEXT,
  answer_text TEXT,
  answer_audio_url TEXT,
  star_score_s INTEGER CHECK (star_score_s BETWEEN 1 AND 5),
  star_score_t INTEGER CHECK (star_score_t BETWEEN 1 AND 5),
  star_score_a INTEGER CHECK (star_score_a BETWEEN 1 AND 5),
  star_score_r INTEGER CHECK (star_score_r BETWEEN 1 AND 5),
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
  evidence_score INTEGER CHECK (evidence_score BETWEEN 1 AND 5),
  overall_score NUMERIC(3,1),
  feedback JSONB,
  filler_word_count INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### salary_research
```sql
CREATE TABLE salary_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  location TEXT,
  experience_years INTEGER,
  industry TEXT,
  percentile_25 INTEGER,
  percentile_50 INTEGER,
  percentile_75 INTEGER,
  total_comp_25 INTEGER,
  total_comp_50 INTEGER,
  total_comp_75 INTEGER,
  data_sources JSONB,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  data_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme_id TEXT DEFAULT 'classic-navy',
  ai_mode TEXT DEFAULT 'balanced' CHECK (ai_mode IN ('fast', 'balanced', 'deep')),
  default_tone TEXT DEFAULT 'professional',
  currency TEXT DEFAULT 'USD',
  email_notifications JSONB DEFAULT '{"matches":true,"updates":true,"reminders":true,"digest":true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

---

## Employer Tables

### employers
```sql
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: user_id = auth.uid()
```

### vacancies
```sql
CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB,
  location TEXT,
  remote_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'archived')),
  rubric_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: employer_id via auth.uid()
```

### scoring_rubrics
```sql
CREATE TABLE scoring_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  /*  [
    { "name": "Product Strategy", "type": "essential", "weight": 30 },
    { "name": "Team Leadership", "type": "essential", "weight": 25 },
    { "name": "Technical Fluency", "type": "preferred", "weight": 20 }
  ] */
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: employer_id via auth.uid()
```

### candidates
```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  resume_url TEXT,
  parsed_data JSONB,
  score NUMERIC(5,2),
  score_breakdown JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'screening', 'shortlisted', 'maybe', 
    'interview', 'offer', 'hired', 'rejected'
  )),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: employer_id via auth.uid()
```

### email_templates
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[],
  type TEXT CHECK (type IN ('interview_invite', 'rejection', 'followup', 'offer', 'custom')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: employer_id via auth.uid()
```

### email_log
```sql
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: employer_id via auth.uid()
```

---

## System Tables

### usage_logs
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Index: user_id + feature + created_at (for rate limiting)
-- RLS: user_id = auth.uid() (read own only)
```

### audit_log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- No RLS (admin only)
-- Index: action, created_at
```

### security_events
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  metadata JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- No RLS (admin only)
```

### referrals
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_id UUID REFERENCES users(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: referrer_id = auth.uid()
```

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(user_id, status);
CREATE INDEX idx_resume_analyses_user ON resume_analyses(user_id, created_at DESC);
CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_candidates_vacancy ON candidates(vacancy_id, score DESC);
CREATE INDEX idx_usage_logs_user_feature ON usage_logs(user_id, feature, created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at DESC);
CREATE INDEX idx_security_events_type ON security_events(event_type, created_at DESC);
```

---

## Row Level Security (RLS) Summary

```
Every table with user_id:
  → FOR ALL USING (user_id = auth.uid())

Employer tables:
  → FOR ALL USING (employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  ))

Admin tables (audit_log, security_events):
  → FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
```
