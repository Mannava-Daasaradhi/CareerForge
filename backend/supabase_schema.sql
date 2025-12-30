-- backend/supabase_schema.sql

-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES (Links to Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  github_username text,
  trust_score int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- 3. INTERVIEW LOGS (Trust Ledger)
create table public.interview_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null, -- SECURED LINK
    session_id text not null,
    topic text not null,
    user_input text,
    ai_response text,
    shadow_critique text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.interview_logs enable row level security;

-- 4. APPLICATIONS (Kanban Board)
create table public.applications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null, -- SECURED LINK
    role_title text not null,
    company_name text not null,
    status text default 'Wishlist',
    salary_range text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.applications enable row level security;

-- 5. CHALLENGE ATTEMPTS (Skill Passport Proof)
create table public.challenge_attempts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null, -- SECURED LINK
    challenge_title text not null,
    user_code text,
    status text not null, -- PASS / FAIL
    output_log text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.challenge_attempts enable row level security;

-- 6. RLS POLICIES (The "Firewall")

-- Profiles: Anyone can read profiles (for networking), but only owner can edit
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- Private Data: Users can ONLY see/edit their own data
create policy "Users can see own interview logs" 
on public.interview_logs for all using (auth.uid() = user_id);

create policy "Users can see own applications" 
on public.applications for all using (auth.uid() = user_id);

create policy "Users can see own challenges" 
on public.challenge_attempts for all using (auth.uid() = user_id);


-- 7. AUTOMATIC PROFILE TRIGGER
-- When a user signs up via Supabase Auth, create a row in 'public.profiles'
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();