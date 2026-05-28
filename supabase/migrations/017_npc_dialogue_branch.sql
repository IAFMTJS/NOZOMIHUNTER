-- Last contact dialogue branch for /contacts persistence

alter table public.npc_relationships
  add column if not exists last_dialogue_branch text;

comment on column public.npc_relationships.last_dialogue_branch is
  'Most recent Contacts UI branch: greeting | briefing | trust';
