-- Quest completion authority + analytics persistence (architecture guardian v0.6.6)

-- Level/rank helpers (mirror progressionConfig: base 100, mult 1.25, max level 100)
create or replace function public.nozomi_level_from_xp(p_xp int)
returns int
language plpgsql
immutable
as $$
declare
  v_level int := 1;
  v_accum int := 0;
  v_needed int;
begin
  if p_xp < 0 then
    return 1;
  end if;

  while v_level < 100 loop
    v_needed := floor(100 * power(1.25::numeric, v_level - 1))::int;
    if v_accum + v_needed > p_xp then
      exit;
    end if;
    v_accum := v_accum + v_needed;
    v_level := v_level + 1;
  end loop;

  return v_level;
end;
$$;

create or replace function public.nozomi_rank_from_level(p_level int)
returns text
language sql
immutable
as $$
  select case
    when p_level >= 75 then 'S'
    when p_level >= 50 then 'A'
    when p_level >= 35 then 'B'
    when p_level >= 20 then 'C'
    when p_level >= 10 then 'D'
    else 'E'
  end;
$$;

-- Autosave may update unlocks/titles/level display but not XP (XP only via quest completion).
create or replace function public.apply_guarded_progression(
  p_xp int,
  p_level int,
  p_rank text,
  p_unlocked_systems jsonb,
  p_unlocked_dungeons jsonb,
  p_titles jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_old_xp int;
  v_old_level int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_xp < 0 or p_level < 1 or p_level > 100 then
    raise exception 'invalid progression payload';
  end if;

  select xp, level into v_old_xp, v_old_level
  from public.progression
  where user_id = v_uid;

  if not found then
    raise exception 'progression row missing';
  end if;

  if p_xp <> v_old_xp then
    raise exception 'xp changes must use complete_quest_guarded';
  end if;

  if p_level < v_old_level then
    raise exception 'level cannot decrease';
  end if;

  if p_level > v_old_level + 3 then
    raise exception 'level jump exceeds server limit';
  end if;

  update public.progression
  set
    level = p_level,
    rank = p_rank,
    unlocked_systems = p_unlocked_systems,
    unlocked_dungeons = p_unlocked_dungeons,
    titles = p_titles
  where user_id = v_uid;
end;
$$;

-- Validates objectives on stored snapshot, grants capped XP, marks quest completed.
create or replace function public.complete_quest_guarded(
  p_quest_id text,
  p_xp_claimed int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_quests%rowtype;
  v_snapshot jsonb;
  v_objective jsonb;
  v_reward_xp int;
  v_xp_grant int;
  v_old_xp int;
  v_old_level int;
  v_new_xp int;
  v_new_level int;
  v_new_rank text;
  v_max_grant constant int := 500;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_quest_id is null or length(trim(p_quest_id)) = 0 then
    raise exception 'quest id required';
  end if;

  if not public.check_player_rate_limit('quest_complete', 12, 60000) then
    raise exception 'quest completion rate limit';
  end if;

  select * into v_row
  from public.user_quests
  where user_id = v_uid
    and status = 'active'
    and (quest_snapshot->>'id') = p_quest_id
  limit 1
  for update;

  if not found then
    raise exception 'active quest not found';
  end if;

  v_snapshot := v_row.quest_snapshot;

  if v_snapshot->'objectives' is null then
    raise exception 'quest objectives missing';
  end if;

  for v_objective in select * from jsonb_array_elements(v_snapshot->'objectives')
  loop
    if coalesce((v_objective->>'currentProgress')::int, 0)
       < coalesce((v_objective->>'requiredProgress')::int, 1) then
      raise exception 'quest objectives not complete';
    end if;
  end loop;

  v_reward_xp := coalesce((v_snapshot->'rewards'->>'xp')::int, 0);
  v_xp_grant := least(
    greatest(0, coalesce(p_xp_claimed, 0)),
    greatest(0, v_reward_xp),
    v_max_grant
  );

  select xp, level into v_old_xp, v_old_level
  from public.progression
  where user_id = v_uid;

  v_new_xp := v_old_xp + v_xp_grant;
  v_new_level := public.nozomi_level_from_xp(v_new_xp);
  v_new_rank := public.nozomi_rank_from_level(v_new_level);

  update public.progression
  set xp = v_new_xp, level = v_new_level, rank = v_new_rank
  where user_id = v_uid;

  update public.user_quests
  set status = 'completed', updated_at = now()
  where id = v_row.id;

  return jsonb_build_object(
    'ok', true,
    'quest_id', p_quest_id,
    'xp', v_new_xp,
    'level', v_new_level,
    'rank', v_new_rank,
    'xp_gained', v_xp_grant,
    'previous_xp', v_old_xp,
    'previous_level', v_old_level
  );
end;
$$;

create table if not exists public.gameplay_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gameplay_events_user_created
  on public.gameplay_events (user_id, created_at desc);

alter table public.gameplay_events enable row level security;

create policy "gameplay_events_insert_own"
  on public.gameplay_events
  for insert
  with check (auth.uid() = user_id);

create policy "gameplay_events_select_own"
  on public.gameplay_events
  for select
  using (auth.uid() = user_id);

create or replace function public.record_gameplay_event(
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return;
  end if;

  insert into public.gameplay_events (user_id, event_type, payload)
  values (v_uid, p_event_type, coalesce(p_payload, '{}'::jsonb));
end;
$$;

grant execute on function public.complete_quest_guarded(text, int) to authenticated;
grant execute on function public.record_gameplay_event(text, jsonb) to authenticated;
