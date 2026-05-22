-- Server-side progression bounds and speech rate limits (architecture guardian)

create table if not exists public.player_rate_limits (
  user_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null,
  window_start timestamptz not null default now(),
  event_count int not null default 0,
  primary key (user_id, action_type)
);

alter table public.player_rate_limits enable row level security;

create policy "rate_limits_own"
  on public.player_rate_limits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Returns true when under limit (and records the attempt).
create or replace function public.check_player_rate_limit(
  p_action_type text,
  p_max_per_window int,
  p_window_ms bigint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.player_rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if v_uid is null then
    return false;
  end if;

  select * into v_row
  from public.player_rate_limits
  where user_id = v_uid and action_type = p_action_type
  for update;

  if not found then
    insert into public.player_rate_limits (user_id, action_type, window_start, event_count)
    values (v_uid, p_action_type, v_now, 1);
    return true;
  end if;

  if extract(epoch from (v_now - v_row.window_start)) * 1000 > p_window_ms then
    update public.player_rate_limits
    set window_start = v_now, event_count = 1
    where user_id = v_uid and action_type = p_action_type;
    return true;
  end if;

  if v_row.event_count >= p_max_per_window then
    return false;
  end if;

  update public.player_rate_limits
  set event_count = event_count + 1
  where user_id = v_uid and action_type = p_action_type;

  return true;
end;
$$;

-- Validates XP/level deltas before persisting progression (client still runs game logic).
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
  v_max_xp_delta constant int := 500;
  v_max_level_jump constant int := 3;
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

  if p_xp < v_old_xp then
    raise exception 'xp cannot decrease';
  end if;

  if p_xp > v_old_xp + v_max_xp_delta then
    raise exception 'xp gain exceeds server limit';
  end if;

  if p_level < v_old_level then
    raise exception 'level cannot decrease';
  end if;

  if p_level > v_old_level + v_max_level_jump then
    raise exception 'level jump exceeds server limit';
  end if;

  update public.progression
  set
    xp = p_xp,
    level = p_level,
    rank = p_rank,
    unlocked_systems = p_unlocked_systems,
    unlocked_dungeons = p_unlocked_dungeons,
    titles = p_titles
  where user_id = v_uid;
end;
$$;

grant execute on function public.check_player_rate_limit(text, int, bigint) to authenticated;
grant execute on function public.apply_guarded_progression(int, int, text, jsonb, jsonb, jsonb) to authenticated;
