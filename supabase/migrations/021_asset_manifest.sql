-- Vol 9 asset manifest + game-assets storage bucket

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-assets',
  'game-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/avif']
)
on conflict (id) do nothing;

create policy "game_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'game-assets');

create policy "game_assets_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'game-assets');

create table if not exists public.asset_manifest (
  asset_key text primary key,
  category text not null,
  variant text not null default 'default',
  path text not null,
  season_id text,
  min_rank text,
  checksum text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists asset_manifest_category_idx on public.asset_manifest (category);
create index if not exists asset_manifest_season_idx on public.asset_manifest (season_id);

alter table public.asset_manifest enable row level security;

create policy "asset_manifest_read" on public.asset_manifest
  for select to authenticated using (active = true);

comment on table public.asset_manifest is 'Vol 9 asset registry — keys resolve to storage paths or public fallbacks';
