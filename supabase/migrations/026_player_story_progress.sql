-- Season narrative persistence + encounter script catalog

create table if not exists public.player_story_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  season_id text not null default 'season-01-broken-signal',
  completed_beat_ids text[] not null default '{}',
  current_beat_id text,
  story_flags jsonb not null default '{}'::jsonb,
  iris_trust int not null default 0 check (iris_trust >= 0 and iris_trust <= 100),
  faction_rep jsonb not null default '{"hunters": 50}'::jsonb,
  archive_index jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_story_beats (
  id text primary key,
  season_id text not null,
  chapter_id text not null,
  mission_index int not null,
  title text not null,
  prerequisite_beat_id text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.content_encounter_scripts (
  id text primary key,
  sector_id text,
  dungeon_key text,
  node_id text,
  script jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

alter table public.content_archive_entries
  add column if not exists required_beat_id text,
  add column if not exists japanese_excerpt text;

alter table public.player_story_progress enable row level security;
alter table public.content_story_beats enable row level security;
alter table public.content_encounter_scripts enable row level security;

create policy "player_story_progress_own" on public.player_story_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "content_story_beats_read" on public.content_story_beats
  for select to authenticated using (true);

create policy "content_encounter_scripts_read" on public.content_encounter_scripts
  for select to authenticated using (active = true);

create or replace function public.get_story_progress(p_user_id uuid)
returns public.player_story_progress
language sql
security definer
set search_path = public
as $$
  select * from public.player_story_progress where user_id = p_user_id;
$$;

create or replace function public.complete_story_beat(
  p_user_id uuid,
  p_beat_id text,
  p_season_id text default 'season-01-broken-signal',
  p_iris_trust_delta int default 5
)
returns public.player_story_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.player_story_progress;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  insert into public.player_story_progress (user_id, season_id)
  values (p_user_id, p_season_id)
  on conflict (user_id) do nothing;

  update public.player_story_progress
  set
    completed_beat_ids = case
      when p_beat_id = any (completed_beat_ids) then completed_beat_ids
      else array_append(completed_beat_ids, p_beat_id)
    end,
    current_beat_id = p_beat_id,
    iris_trust = least(100, iris_trust + greatest(0, p_iris_trust_delta)),
    updated_at = now()
  where user_id = p_user_id
  returning * into row;

  return row;
end;
$$;

grant execute on function public.get_story_progress(uuid) to authenticated;
grant execute on function public.complete_story_beat(uuid, text, text, int) to authenticated;
