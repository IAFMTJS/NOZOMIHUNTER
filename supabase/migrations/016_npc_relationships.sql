-- NPC relationship vectors for Deep Cover and contract social modes

create table if not exists public.npc_relationships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  npc_key text not null,
  trust int not null default 50 check (trust >= 0 and trust <= 100),
  successful_exchanges int not null default 0,
  failed_exchanges int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, npc_key)
);

create index if not exists npc_relationships_user_idx
  on public.npc_relationships (user_id);

alter table public.npc_relationships enable row level security;

create policy "Users read own npc relationships"
  on public.npc_relationships for select
  using (auth.uid() = user_id);

create policy "Users upsert own npc relationships"
  on public.npc_relationships for insert
  with check (auth.uid() = user_id);

create policy "Users update own npc relationships"
  on public.npc_relationships for update
  using (auth.uid() = user_id);
