-- NOZOMI Foundation Schema
-- Uses gen_random_uuid() (PG 13+) — uuid-ossp is deprecated on hosted Supabase.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null default 'Hunter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  vocabulary int not null default 0,
  grammar int not null default 0,
  listening int not null default 0,
  speaking int not null default 0,
  confidence int not null default 0,
  intelligence int not null default 0,
  consistency int not null default 0
);

create table if not exists public.progression (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  level int not null default 1,
  xp int not null default 0,
  rank text not null default 'E',
  unlocked_systems jsonb not null default '["quests","dashboard"]'::jsonb,
  unlocked_dungeons jsonb not null default '[]'::jsonb,
  titles jsonb not null default '[]'::jsonb
);

create table if not exists public.player_penalties (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  corruption int not null default 0,
  fatigue int not null default 0,
  xp_debt int not null default 0
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text not null,
  difficulty text not null,
  rewards jsonb not null default '{}'::jsonb,
  penalties jsonb,
  objectives jsonb not null default '[]'::jsonb,
  requirements jsonb
);

create table if not exists public.user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quest_id uuid references public.quests (id),
  status text not null default 'active',
  progress jsonb not null default '{}'::jsonb,
  quest_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  memory jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed MVP quests
insert into public.quests (type, title, description, difficulty, rewards, objectives)
values
  ('VOCABULARY', 'Word Hunt', 'Review 5 vocabulary targets.', 'EASY', '{"xp":50}', '[{"id":"obj-1","description":"Complete vocabulary review","currentProgress":0,"requiredProgress":5,"completed":false}]'),
  ('LISTENING', 'Signal Scan', 'Parse 3 listening fragments.', 'NORMAL', '{"xp":75}', '[{"id":"obj-1","description":"Complete listening checks","currentProgress":0,"requiredProgress":3,"completed":false}]'),
  ('GRAMMAR', 'Syntax Patrol', 'Resolve 4 grammar encounters.', 'NORMAL', '{"xp":80}', '[{"id":"obj-1","description":"Complete grammar encounters","currentProgress":0,"requiredProgress":4,"completed":false}]'),
  ('SPEECH', 'Voice Trial', 'Complete 2 speech checks.', 'HARD', '{"xp":100}', '[{"id":"obj-1","description":"Complete speech checks","currentProgress":0,"requiredProgress":2,"completed":false}]')
on conflict do nothing;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Hunter'));

  insert into public.player_stats (user_id) values (new.id);
  insert into public.progression (user_id) values (new.id);
  insert into public.player_penalties (user_id) values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.player_stats enable row level security;
alter table public.progression enable row level security;
alter table public.player_penalties enable row level security;
alter table public.quests enable row level security;
alter table public.user_quests enable row level security;
alter table public.conversations enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "player_stats_own" on public.player_stats for all using (auth.uid() = user_id);
create policy "progression_own" on public.progression for all using (auth.uid() = user_id);
create policy "penalties_own" on public.player_penalties for all using (auth.uid() = user_id);

create policy "quests_read_all" on public.quests for select to authenticated using (true);

create policy "user_quests_own" on public.user_quests for all using (auth.uid() = user_id);
create policy "conversations_own" on public.conversations for all using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger user_quests_updated before update on public.user_quests
  for each row execute procedure public.set_updated_at();
