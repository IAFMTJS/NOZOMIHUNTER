-- Economy, inventory, tracked mission, brew, stamina

alter table public.progression
  add column if not exists credits int not null default 0,
  add column if not exists stamina int not null default 100,
  add column if not exists stamina_max int not null default 100,
  add column if not exists brew_tokens int not null default 10,
  add column if not exists pending_rewards jsonb;

alter table public.profiles
  add column if not exists tracked_quest_id uuid references public.user_quests (id) on delete set null;

create table if not exists public.item_catalog (
  key text primary key,
  name text not null,
  category text not null,
  icon text not null default 'crate',
  stackable boolean not null default true
);

create table if not exists public.player_inventory (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_key text not null references public.item_catalog (key),
  quantity int not null default 1 check (quantity > 0),
  equipped boolean not null default false,
  primary key (user_id, item_key)
);

create index if not exists player_inventory_user_idx on public.player_inventory (user_id);

alter table public.item_catalog enable row level security;
alter table public.player_inventory enable row level security;

create policy "item_catalog_read"
  on public.item_catalog for select to authenticated using (true);

create policy "player_inventory_own"
  on public.player_inventory for all using (auth.uid() = user_id);

insert into public.item_catalog (key, name, category, icon, stackable)
values
  ('shadow-shard', 'Shadow Shard', 'MATERIAL', 'shard', true),
  ('signal-cache', 'Signal Cache', 'CONSUMABLE', 'cache', true),
  ('hunter-blade', 'Hunter Blade', 'EQUIPMENT', 'blade', false),
  ('echo-ring', 'Echo Ring', 'EQUIPMENT', 'ring', false),
  ('recovery-draft', 'Recovery Draft', 'CONSUMABLE', 'potion', true),
  ('data-scroll', 'Data Scroll', 'MISC', 'scroll', true)
on conflict (key) do nothing;

-- Grant inventory items from json array [{itemKey, quantity}]
create or replace function public.grant_inventory_items(
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_key text;
  v_qty int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    return;
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) = 'string' then
      v_key := v_item #>> '{}';
      v_qty := 1;
    else
      v_key := coalesce(v_item->>'itemKey', v_item->>'key');
      v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    end if;
    if v_key is null or length(trim(v_key)) = 0 then
      continue;
    end if;

    insert into public.player_inventory (user_id, item_key, quantity)
    values (v_uid, v_key, v_qty)
    on conflict (user_id, item_key)
    do update set quantity = public.player_inventory.quantity + excluded.quantity;
  end loop;
end;
$$;

create or replace function public.spend_stamina_guarded(
  p_amount int,
  p_dungeon_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_stamina int;
  v_unlocked jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'invalid stamina amount';
  end if;

  select stamina, unlocked_dungeons into v_stamina, v_unlocked
  from public.progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'progression missing';
  end if;

  if p_dungeon_key is not null
     and not (v_unlocked ? p_dungeon_key)
     and p_dungeon_key <> 'dungeon:neon-corridor' then
    raise exception 'dungeon not unlocked';
  end if;

  if v_stamina < p_amount then
    raise exception 'insufficient stamina';
  end if;

  update public.progression
  set stamina = stamina - p_amount
  where user_id = v_uid;

  return jsonb_build_object('ok', true, 'stamina_spent', p_amount);
end;
$$;

create or replace function public.brew_word_guarded(
  p_word_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_tokens int;
  v_cost constant int := 5;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_word_id is null or length(trim(p_word_id)) = 0 then
    raise exception 'word id required';
  end if;

  select brew_tokens into v_tokens
  from public.progression
  where user_id = v_uid
  for update;

  if v_tokens < v_cost then
    raise exception 'insufficient brew tokens';
  end if;

  update public.progression
  set brew_tokens = brew_tokens - v_cost
  where user_id = v_uid;

  insert into public.word_mastery (user_id, word_id, mastery, correct_count, wrong_count, last_seen_at)
  values (v_uid, p_word_id, 10, 0, 0, now())
  on conflict (user_id, word_id)
  do update set mastery = greatest(word_mastery.mastery, 10), last_seen_at = now();

  return jsonb_build_object('ok', true, 'word_id', p_word_id, 'tokens_spent', v_cost);
end;
$$;

-- Extend complete_quest_guarded to grant credits and items
create or replace function public.complete_quest_guarded(
  p_quest_id text,
  p_xp_claimed int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_quests%rowtype;
  v_snapshot jsonb;
  v_objective jsonb;
  v_reward_xp int;
  v_reward_credits int;
  v_reward_items jsonb;
  v_xp_grant int;
  v_old_xp int;
  v_old_level int;
  v_new_xp int;
  v_new_level int;
  v_new_rank text;
  v_max_grant constant int := 500;
  v_pending jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_quest_id is null or length(trim(p_quest_id)) = 0 then
    raise exception 'quest id required';
  end if;

  if not public.check_player_rate_limit('quest_complete', 12, 60000) then
    raise exception 'quest completion rate limit';
  end if;

  select * into v_row
  from public.user_quests
  where user_id = v_uid
    and status = 'active'
    and (quest_snapshot->>'id') = p_quest_id
  limit 1
  for update;

  if not found then
    raise exception 'active quest not found';
  end if;

  v_snapshot := v_row.quest_snapshot;

  if v_snapshot->'objectives' is null then
    raise exception 'quest objectives missing';
  end if;

  for v_objective in select * from jsonb_array_elements(v_snapshot->'objectives')
  loop
    if coalesce((v_objective->>'currentProgress')::int, 0)
       < coalesce((v_objective->>'requiredProgress')::int, 1) then
      raise exception 'quest objectives not complete';
    end if;
  end loop;

  v_reward_xp := coalesce((v_snapshot->'rewards'->>'xp')::int, 0);
  v_reward_credits := coalesce((v_snapshot->'rewards'->>'credits')::int, 0);
  v_reward_items := coalesce(v_snapshot->'rewards'->'items', '[]'::jsonb);

  v_xp_grant := least(
    greatest(0, coalesce(p_xp_claimed, 0)),
    greatest(0, v_reward_xp),
    v_max_grant
  );

  select xp, level into v_old_xp, v_old_level
  from public.progression
  where user_id = v_uid;

  v_new_xp := v_old_xp + v_xp_grant;
  v_new_level := public.nozomi_level_from_xp(v_new_xp);
  v_new_rank := public.nozomi_rank_from_level(v_new_level);

  v_pending := jsonb_build_object(
    'xpGained', v_xp_grant,
    'credits', v_reward_credits,
    'items', v_reward_items,
    'questId', p_quest_id,
    'claimed', false
  );

  update public.progression
  set
    xp = v_new_xp,
    level = v_new_level,
    rank = v_new_rank,
    credits = credits + v_reward_credits,
    pending_rewards = v_pending
  where user_id = v_uid;

  perform public.grant_inventory_items(v_reward_items);

  update public.user_quests
  set status = 'completed', updated_at = now()
  where id = v_row.id;

  return jsonb_build_object(
    'ok', true,
    'quest_id', p_quest_id,
    'xp', v_new_xp,
    'level', v_new_level,
    'rank', v_new_rank,
    'xp_gained', v_xp_grant,
    'credits_gained', v_reward_credits,
    'previous_xp', v_old_xp,
    'previous_level', v_old_level,
    'pending_rewards', v_pending
  );
end;
$$;

create or replace function public.clear_pending_rewards_guarded()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pending jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select pending_rewards into v_pending
  from public.progression
  where user_id = v_uid
  for update;

  update public.progression
  set pending_rewards = null
  where user_id = v_uid;

  return coalesce(v_pending, '{}'::jsonb);
end;
$$;

grant execute on function public.grant_inventory_items(jsonb) to authenticated;
grant execute on function public.spend_stamina_guarded(int, text) to authenticated;
grant execute on function public.brew_word_guarded(text) to authenticated;
grant execute on function public.clear_pending_rewards_guarded() to authenticated;

-- Starter inventory for new hunters
create or replace function public.seed_starter_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_inventory (user_id, item_key, quantity)
  values
    (new.id, 'recovery-draft', 2),
    (new.id, 'shadow-shard', 1)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists seed_inventory_on_profile on public.profiles;
create trigger seed_inventory_on_profile
  after insert on public.profiles
  for each row execute procedure public.seed_starter_inventory();
