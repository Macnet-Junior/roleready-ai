# RoleReady AI — Database Schema & Data Models

Relational schema overview for RoleReady AI data persistence layer (PostgreSQL / Supabase RLS).

## Core Tables

### 1. `users`
- `id` (uuid, primary key)
- `email` (varchar, unique, indexed)
- `name` (varchar)
- `role` (enum: 'candidate', 'employer')
- `plan_tier` (varchar, default: 'Free Candidate')
- `created_at` (timestamp)
- *RLS Policy*: `auth.uid() == id`

### 2. `applications`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key -> users.id)
- `company` (varchar)
- `role_title` (varchar)
- `stage` (enum: 'wishlist', 'applied', 'interview', 'offer', 'closed')
- `match_score` (integer)
- `applied_date` (varchar)
- `location` (varchar)
- `notes` (text, encrypted)
- *RLS Policy*: `auth.uid() == user_id`

### 3. `resumes`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key -> users.id)
- `raw_text` (text, encrypted)
- `filename` (varchar)
- `parsed_skills` (jsonb)
- `created_at` (timestamp)
- *RLS Policy*: `auth.uid() == user_id`

### 4. `user_preferences`
- `user_id` (uuid, primary key, foreign key -> users.id)
- `app_theme_id` (varchar, default: 'theme_app_dark_navy')
- `resume_theme_id` (varchar, default: 'theme_executive_slate')
- `updated_at` (timestamp)
- *RLS Policy*: `auth.uid() == user_id`

### 5. `user_consent`
- `user_id` (uuid, primary key, foreign key -> users.id)
- `analytics` (boolean, default: true)
- `marketing` (boolean, default: false)
- `ai_training` (boolean, default: false)
- `updated_at` (timestamp)
- *RLS Policy*: `auth.uid() == user_id`

### 6. `purchased_themes`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key -> users.id)
- `theme_id` (varchar)
- `purchased_at` (timestamp)
- *RLS Policy*: `auth.uid() == user_id`
