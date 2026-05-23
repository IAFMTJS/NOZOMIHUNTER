-- Rename legacy unlocked_systems key dashboard → home

update public.progression
set unlocked_systems = replace(unlocked_systems::text, '"dashboard"', '"home"')::jsonb
where unlocked_systems::text like '%dashboard%';

alter table public.progression
  alter column unlocked_systems set default '["quests","home"]'::jsonb;
