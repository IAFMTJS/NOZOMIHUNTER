-- Phase 3: JMDict vocabulary storage + per-player mastery

create table if not exists public.vocabulary_entries (
  id text primary key,
  ent_seq bigint not null unique,
  japanese text[] not null,
  reading text[] not null,
  meanings text[] not null,
  romaji text not null,
  jlpt text,
  frequency_tier int not null default 50,
  search_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists vocabulary_entries_freq_idx
  on public.vocabulary_entries (frequency_tier);

create index if not exists vocabulary_entries_search_idx
  on public.vocabulary_entries using gin (to_tsvector('simple', search_text));

create table if not exists public.word_mastery (
  user_id uuid not null references public.profiles (id) on delete cascade,
  word_id text not null,
  mastery int not null default 0 check (mastery >= 0 and mastery <= 100),
  correct_count int not null default 0,
  wrong_count int not null default 0,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create index if not exists word_mastery_user_idx on public.word_mastery (user_id);

alter table public.vocabulary_entries enable row level security;
alter table public.word_mastery enable row level security;

create policy "vocabulary_entries_read"
  on public.vocabulary_entries for select to authenticated using (true);

create policy "word_mastery_own"
  on public.word_mastery for all using (auth.uid() = user_id);
