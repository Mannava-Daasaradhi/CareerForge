-- 1. Enable Vector Extension (for future RAG/Embeddings)
create extension if not exists vector;

-- 2. Create the 'interview_logs' Table
-- This stores every Q&A pair from Voice and Text interviews.
create table interview_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null,
  topic text not null,
  user_input text not null,
  ai_response text not null,
  shadow_critique text, -- The "Whisper" from the Auditor
  vibe_metrics jsonb,   -- Stores Confidence/Clarity scores from Voice Engine
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create the 'challenge_attempts' Table
-- Stores the results of the "Cursed Gauntlet".
create table challenge_attempts (
  id uuid default gen_random_uuid() primary key,
  username text not null, -- e.g., 'torvalds'
  challenge_title text not null,
  code_submitted text not null,
  status text not null, -- 'PASS' or 'FAIL'
  execution_output text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
-- For now, we allow public insert/read for the demo. 
-- In production, you would lock this down to authenticated users.
alter table interview_logs enable row level security;
alter table challenge_attempts enable row level security;

create policy "Enable read access for all users" on interview_logs for select using (true);
create policy "Enable insert access for all users" on interview_logs for insert with check (true);

create policy "Enable read access for all users" on challenge_attempts for select using (true);
create policy "Enable insert access for all users" on challenge_attempts for insert with check (true);

-- 5. Create 'applications' Table
-- This tracks the Kanban board state (Wishlist -> Applied -> Interview -> etc.)
-- 5. Create 'applications' Table
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid(), 
  role_title text not null,
  company_name text not null,
  status text not null default 'Wishlist',
  salary_range text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS)
alter table applications enable row level security;

-- FIX: Use 'FOR ALL' instead of listing operations
create policy "Public access" on applications for all using (true) with check (true);