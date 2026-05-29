create table if not exists public.season_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  season_id text not null,
  points int not null default 0,
  tier int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, season_id)
);

alter table public.season_progress enable row level security;

create policy "season_progress_own" on public.season_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
