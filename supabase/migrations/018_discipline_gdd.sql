-- GDD wave: discipline currency on progression

alter table public.progression
  add column if not exists discipline int not null default 0;

comment on column public.progression.discipline is 'Secondary meta currency (training, contracts, dungeons)';
