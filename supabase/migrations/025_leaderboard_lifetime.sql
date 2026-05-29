-- Lifetime leaderboard aggregate (all-time scoring events)

create or replace function public.leaderboard_aggregate_lifetime(p_limit int default 20)
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
    group by e.user_id
  )
  select
    s.user_id,
    coalesce(p.username, 'Operator') as username,
    s.score,
    case
      when s.score >= 500 then 'SSS'
      when s.score >= 300 then 'SS'
      when s.score >= 150 then 'S'
      when s.score >= 60 then 'A'
      else 'B'
    end as tier
  from scored s
  join public.profiles p on p.id = s.user_id
  order by s.score desc
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.leaderboard_aggregate_lifetime(int) to authenticated;
