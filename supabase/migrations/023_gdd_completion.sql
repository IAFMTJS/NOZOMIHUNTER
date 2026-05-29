-- GDD completion: global leaderboard, prestige, season helpers

alter table public.progression
  add column if not exists prestige_count int not null default 0;

comment on column public.progression.prestige_count is 'SSS prestige resets completed';

-- Weekly leaderboard from gameplay_events (authenticated read)
create or replace function public.leaderboard_aggregate(p_limit int default 20)
returns table (
  user_id uuid,
  username text,
  score bigint,
  tier text
)
language sql
security definer
stable
set search_path = public
as $$
  with scored as (
    select
      e.user_id,
      count(*) filter (
        where e.event_type in (
          'QUEST_COMPLETED',
          'DUNGEON_COMPLETED',
          'SECTOR_CLEARED',
          'ENCOUNTER_COMPLETED'
        )
      ) as score
    from public.gameplay_events e
    where e.created_at > now() - interval '7 days'
    group by e.user_id
  )
  select
    s.user_id,
    coalesce(p.username, 'Operator') as username,
    s.score,
    case
      when s.score >= 200 then 'SSS'
      when s.score >= 120 then 'SS'
      when s.score >= 60 then 'S'
      when s.score >= 30 then 'A'
      else 'B'
    end as tier
  from scored s
  join public.profiles p on p.id = s.user_id
  order by s.score desc
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.leaderboard_aggregate(int) to authenticated;

-- Prestige reset at SSS max level (one-way; increments prestige_count)
create or replace function public.apply_prestige_reset()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.progression%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_row from public.progression where user_id = v_uid for update;
  if not found then
    raise exception 'progression row missing';
  end if;

  if v_row.rank <> 'SSS' or v_row.level < 100 then
    raise exception 'prestige requires rank SSS at level 100';
  end if;

  update public.progression
  set
    level = 1,
    xp = 0,
    rank = 'E',
    prestige_count = v_row.prestige_count + 1,
    discipline = discipline + 10
  where user_id = v_uid;

  return jsonb_build_object(
    'prestigeCount', v_row.prestige_count + 1,
    'level', 1,
    'rank', 'E'
  );
end;
$$;

grant execute on function public.apply_prestige_reset() to authenticated;

-- Bump season points on dungeon/quest completion (called from client after events)
create or replace function public.add_season_points(p_season_id text, p_points int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or p_points <= 0 then
    return;
  end if;

  insert into public.season_progress (user_id, season_id, points, tier, updated_at)
  values (
    v_uid,
    p_season_id,
    p_points,
    greatest(0, p_points / 100),
    now()
  )
  on conflict (user_id, season_id) do update
  set
    points = season_progress.points + excluded.points,
    tier = greatest(season_progress.tier, excluded.tier),
    updated_at = now();
end;
$$;

grant execute on function public.add_season_points(text, int) to authenticated;
