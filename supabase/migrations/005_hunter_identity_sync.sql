-- Hunter identity + discipline synchronization fields

alter table public.profiles
  add column if not exists hunter_codename text,
  add column if not exists registry_id text,
  add column if not exists last_active_date date,
  add column if not exists sync_chain_days int not null default 0;

create index if not exists profiles_registry_id_idx on public.profiles (registry_id);
