-- Vol 10 achievement definitions (ingest from content/seeds/content-achievements.json)

create table if not exists public.content_achievements (
  id text primary key,
  title text not null,
  description text not null,
  unlock_key text,
  active boolean not null default true
);

alter table public.content_achievements enable row level security;

create policy "content_achievements_read" on public.content_achievements
  for select to authenticated using (active = true);
