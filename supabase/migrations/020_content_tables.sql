-- Content catalog tables (Vol 11) — seed via npm run ingest:content

create table if not exists public.content_contracts (
  id text primary key,
  title text not null,
  channel text not null,
  template jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table if not exists public.content_boss_phases (
  id text primary key,
  boss_key text not null,
  phase_index int not null,
  spec jsonb not null default '{}'::jsonb
);

create table if not exists public.content_relic_effects (
  item_key text primary key,
  effect_type text not null,
  value numeric not null default 0
);

create table if not exists public.content_archive_entries (
  id text primary key,
  title text not null,
  teaser text not null,
  lore_excerpt text,
  min_rank text,
  linked_contract_id text
);

alter table public.content_contracts enable row level security;
alter table public.content_boss_phases enable row level security;
alter table public.content_relic_effects enable row level security;
alter table public.content_archive_entries enable row level security;

create policy "content_contracts_read" on public.content_contracts
  for select to authenticated using (active = true);

create policy "content_boss_phases_read" on public.content_boss_phases
  for select to authenticated using (true);

create policy "content_relic_effects_read" on public.content_relic_effects
  for select to authenticated using (true);

create policy "content_archive_entries_read" on public.content_archive_entries
  for select to authenticated using (true);
