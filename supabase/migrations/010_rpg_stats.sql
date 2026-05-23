-- RPG core stats (STR/AGI/INT/VIT) on progression

alter table public.progression
  add column if not exists rpg_strength int not null default 0,
  add column if not exists rpg_agility int not null default 0,
  add column if not exists rpg_intelligence int not null default 0,
  add column if not exists rpg_vitality int not null default 0;

-- Backfill: level-based baseline (mirrors deriveRpgStatsFromProgress at rank E)
update public.progression p
set
  rpg_strength = greatest(p.rpg_strength, 8 + (p.level - 1) * 2),
  rpg_agility = greatest(p.rpg_agility, 8 + (p.level - 1) * 2),
  rpg_intelligence = greatest(p.rpg_intelligence, 10 + (p.level - 1) * 3),
  rpg_vitality = greatest(p.rpg_vitality, 10 + (p.level - 1) * 2)
where p.rpg_strength = 0 or p.rpg_agility = 0;

create or replace function public.apply_guarded_progression(
  p_xp int,
  p_level int,
  p_rank text,
  p_unlocked_systems jsonb,
  p_unlocked_dungeons jsonb,
  p_titles jsonb,
  p_rpg_strength int default null,
  p_rpg_agility int default null,
  p_rpg_intelligence int default null,
  p_rpg_vitality int default null
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
    titles = p_titles,
    rpg_strength = coalesce(p_rpg_strength, rpg_strength),
    rpg_agility = coalesce(p_rpg_agility, rpg_agility),
    rpg_intelligence = coalesce(p_rpg_intelligence, rpg_intelligence),
    rpg_vitality = coalesce(p_rpg_vitality, rpg_vitality)
  where user_id = v_uid;
end;
$$;
