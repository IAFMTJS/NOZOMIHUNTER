-- Web Push subscriptions (sent via GitHub Actions scheduled workflow)

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  subscription jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_active_idx
  on public.push_subscriptions (active)
  where active = true;

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_own" on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.upsert_push_subscription(
  p_user_id uuid,
  p_subscription jsonb
)
returns public.push_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.push_subscriptions;
  endpoint text;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  endpoint := p_subscription->>'endpoint';
  if endpoint is null or length(endpoint) < 8 then
    raise exception 'invalid subscription endpoint';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, subscription, active, updated_at)
  values (p_user_id, endpoint, p_subscription, true, now())
  on conflict (user_id, endpoint) do update
  set subscription = excluded.subscription,
      active = true,
      updated_at = now()
  returning * into row;

  return row;
end;
$$;

create or replace function public.deactivate_push_subscription(
  p_user_id uuid,
  p_endpoint text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  update public.push_subscriptions
  set active = false, updated_at = now()
  where user_id = p_user_id and endpoint = p_endpoint;
end;
$$;

grant execute on function public.upsert_push_subscription(uuid, jsonb) to authenticated;
grant execute on function public.deactivate_push_subscription(uuid, text) to authenticated;
