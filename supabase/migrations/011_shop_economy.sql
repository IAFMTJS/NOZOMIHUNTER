-- Shop economy expansion: catalog metadata, active boosts, XP conversion

alter table public.item_catalog
  add column if not exists shop_category text,
  add column if not exists rarity text,
  add column if not exists description text,
  add column if not exists effect_type text,
  add column if not exists rotation_eligible boolean not null default true;

alter table public.progression
  add column if not exists active_boosts jsonb not null default '[]'::jsonb,
  add column if not exists xp_conversion_date date,
  add column if not exists xp_conversion_count int not null default 0;

-- Existing catalog metadata
update public.item_catalog set
  shop_category = 'STANDARD',
  rarity = 'COMMON',
  rotation_eligible = false
where shop_category is null;

update public.item_catalog set
  name = 'Recovery Draft',
  description = 'Emergency stamina recovery draft.',
  shop_category = 'STANDARD',
  rarity = 'COMMON',
  effect_type = null,
  rotation_eligible = false
where key = 'recovery-draft';

-- Combat boosts
insert into public.item_catalog (key, name, category, icon, stackable, credit_price, shop_category, rarity, description, effect_type, rotation_eligible)
values
  ('unlimited-mistakes', 'Unlimited Mistakes', 'CONSUMABLE', 'shield', true, 320, 'COMBAT_BOOST', 'RARE', 'Mistakes do not reduce HP for 15 minutes.', 'MISTAKE_SHIELD', true),
  ('xp-booster-small', 'XP Booster (Small)', 'CONSUMABLE', 'boost', true, 150, 'COMBAT_BOOST', 'COMMON', '+25% XP gain for 15 minutes.', 'XP_BOOST', true),
  ('xp-booster-major', 'XP Booster (Major)', 'CONSUMABLE', 'boost', true, 350, 'COMBAT_BOOST', 'RARE', '+50% XP gain for 30 minutes.', 'XP_BOOST', true),
  ('xp-booster-insane', 'XP Booster (Insane)', 'CONSUMABLE', 'boost', true, 600, 'COMBAT_BOOST', 'EPIC', '+100% XP gain for 15 minutes.', 'XP_BOOST', true),
  ('stat-buffer-int', 'Stat Buffer: INT', 'CONSUMABLE', 'stat', true, 200, 'COMBAT_BOOST', 'RARE', 'Temporary intelligence enhancement.', 'STAT_BUFFER', true),
  ('stat-buffer-focus', 'Stat Buffer: Focus', 'CONSUMABLE', 'stat', true, 200, 'COMBAT_BOOST', 'RARE', 'Improved focus and combo windows.', 'STAT_BUFFER', true),
  ('rank-shield', 'Rank Shield', 'CONSUMABLE', 'shield', true, 500, 'COMBAT_BOOST', 'LEGENDARY', 'Prevents rank loss after one failure.', 'RANK_SHIELD', true)
on conflict (key) do update set
  credit_price = excluded.credit_price,
  shop_category = excluded.shop_category,
  rarity = excluded.rarity,
  description = excluded.description,
  effect_type = excluded.effect_type,
  rotation_eligible = excluded.rotation_eligible;

-- Quest manipulation
insert into public.item_catalog (key, name, category, icon, stackable, credit_price, shop_category, rarity, description, effect_type, rotation_eligible)
values
  ('system-breach', 'System Breach', 'CONSUMABLE', 'breach', true, 800, 'QUEST_MANIPULATION', 'LEGENDARY', 'Hard rewards on easy difficulty. One use.', 'DIFFICULTY_OVERRIDE', true),
  ('reward-amplifier', 'Reward Amplifier', 'CONSUMABLE', 'amp', true, 450, 'QUEST_MANIPULATION', 'EPIC', 'Doubles next dungeon rewards.', 'REWARD_AMPLIFIER', true),
  ('quest-retry-ticket', 'Quest Retry Ticket', 'CONSUMABLE', 'retry', true, 250, 'QUEST_MANIPULATION', 'RARE', 'Instantly retry a failed quest.', 'QUEST_RETRY', true),
  ('skip-token', 'Skip Token', 'CONSUMABLE', 'skip', true, 400, 'QUEST_MANIPULATION', 'EPIC', 'Skip one non-boss objective.', 'SKIP_TOKEN', true)
on conflict (key) do update set
  credit_price = excluded.credit_price,
  shop_category = excluded.shop_category,
  rarity = excluded.rarity,
  description = excluded.description,
  effect_type = excluded.effect_type,
  rotation_eligible = excluded.rotation_eligible;

-- Dungeon utility
insert into public.item_catalog (key, name, category, icon, stackable, credit_price, shop_category, rarity, description, effect_type, rotation_eligible)
values
  ('revive-token', 'Revive Token', 'CONSUMABLE', 'revive', true, 350, 'DUNGEON_UTILITY', 'EPIC', 'One additional revive during a dungeon run.', 'REVIVE_TOKEN', true),
  ('escape-beacon', 'Escape Beacon', 'CONSUMABLE', 'beacon', true, 550, 'DUNGEON_UTILITY', 'LEGENDARY', 'Emergency dungeon escape without heavy penalties.', 'ESCAPE_BEACON', true),
  ('time-freeze', 'Time Freeze', 'CONSUMABLE', 'freeze', true, 280, 'DUNGEON_UTILITY', 'RARE', 'Pause dungeon timer for 30 seconds.', 'TIME_FREEZE', true)
on conflict (key) do update set
  credit_price = excluded.credit_price,
  shop_category = excluded.shop_category,
  rarity = excluded.rarity,
  description = excluded.description,
  effect_type = excluded.effect_type,
  rotation_eligible = excluded.rotation_eligible;

-- Cosmetics
insert into public.item_catalog (key, name, category, icon, stackable, credit_price, shop_category, rarity, description, effect_type, rotation_eligible)
values
  ('aura-shadow', 'Shadow Aura', 'MISC', 'aura', false, 400, 'COSMETIC', 'RARE', 'Dark shadow aura cosmetic.', 'COSMETIC_AURA', true),
  ('aura-divine', 'Divine Aura', 'MISC', 'aura', false, 400, 'COSMETIC', 'RARE', 'Radiant divine aura cosmetic.', 'COSMETIC_AURA', true),
  ('title-unbroken', 'Title: The Unbroken', 'MISC', 'title', false, 750, 'COSMETIC', 'LEGENDARY', 'Prestige hunter title unlock.', 'TITLE_UNLOCK', true)
on conflict (key) do update set
  credit_price = excluded.credit_price,
  shop_category = excluded.shop_category,
  rarity = excluded.rarity,
  description = excluded.description,
  effect_type = excluded.effect_type,
  rotation_eligible = excluded.rotation_eligible;

-- Deterministic rotation hash (mirrors client shopRotationSystem)
create or replace function public.nozomi_shop_hash(p_seed text)
returns int
language plpgsql
immutable
as $$
declare
  v_h int := 0;
  v_i int;
  v_len int := length(p_seed);
begin
  for v_i in 1..v_len loop
    v_h := ((v_h * 31) + ascii(substr(p_seed, v_i, 1)))::bigint & 4294967295;
  end loop;
  return v_h;
end;
$$;

create or replace function public.is_shop_item_available(
  p_item_key text,
  p_user_id uuid,
  p_date date default (timezone('utc', now()))::date
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rotation_eligible boolean;
  v_eligible_keys text[];
  v_seed text;
  v_slot_count constant int := 8;
  v_selected text[] := '{}';
  v_attempt int := 0;
  v_idx int;
  v_key text;
  v_len int;
begin
  select rotation_eligible into v_rotation_eligible
  from public.item_catalog
  where key = p_item_key;

  if not found then
    return false;
  end if;

  if v_rotation_eligible = false then
    return true;
  end if;

  select array_agg(key order by key)
  into v_eligible_keys
  from public.item_catalog
  where rotation_eligible = true
    and credit_price is not null
    and credit_price > 0;

  if v_eligible_keys is null or array_length(v_eligible_keys, 1) is null then
    return true;
  end if;

  v_len := array_length(v_eligible_keys, 1);
  v_seed := p_user_id::text || ':' || p_date::text;

  while array_length(v_selected, 1) is null or array_length(v_selected, 1) < v_slot_count loop
    exit when v_attempt >= v_len * 4;
    v_idx := public.nozomi_shop_hash(v_seed || ':rot:' || v_attempt) % v_len + 1;
    v_key := v_eligible_keys[v_idx];
    if not v_key = any(v_selected) then
      v_selected := array_append(v_selected, v_key);
    end if;
    v_attempt := v_attempt + 1;
  end loop;

  return p_item_key = any(v_selected);
end;
$$;

create or replace function public.effective_shop_price(
  p_item_key text,
  p_user_id uuid,
  p_date date default (timezone('utc', now()))::date
)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_base int;
  v_seed text;
  v_discount int;
  v_rotation_eligible boolean;
begin
  select credit_price, rotation_eligible
  into v_base, v_rotation_eligible
  from public.item_catalog
  where key = p_item_key;

  if v_base is null then
    return null;
  end if;

  if v_rotation_eligible = false then
    return v_base;
  end if;

  if not public.is_shop_item_available(p_item_key, p_user_id, p_date) then
    return null;
  end if;

  v_seed := p_user_id::text || ':' || p_date::text;
  v_discount := (public.nozomi_shop_hash(v_seed || ':disc:' || p_item_key) % 25) + 1;
  return greatest(1, floor(v_base * (1 - v_discount / 100.0))::int);
end;
$$;

-- XP → credits conversion (guarded, daily limit, tax applied server-side)
create or replace function public.convert_xp_to_credits_guarded(
  p_xp_amount int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_xp int;
  v_credits int;
  v_count int;
  v_last date;
  v_gained int;
  v_tax constant numeric := 0.3;
  v_daily_limit constant int := 3;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_xp_amount is null or p_xp_amount < 100 then
    raise exception 'minimum 100 XP required';
  end if;

  select xp, credits, xp_conversion_count, xp_conversion_date
  into v_xp, v_credits, v_count, v_last
  from public.progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'progression missing';
  end if;

  if v_last = v_today and v_count >= v_daily_limit then
    raise exception 'daily conversion limit reached';
  end if;

  if v_xp < p_xp_amount then
    raise exception 'insufficient XP';
  end if;

  -- Tiered conversion (inefficient at scale)
  if p_xp_amount >= 5000 then
    v_gained := floor(250 * (p_xp_amount / 5000.0) * (1 - v_tax))::int;
  elsif p_xp_amount >= 1000 then
    v_gained := floor(70 * (p_xp_amount / 1000.0) * (1 - v_tax))::int;
  else
    v_gained := floor(10 * (p_xp_amount / 100.0) * (1 - v_tax))::int;
  end if;

  if v_gained < 1 then
    raise exception 'conversion yield too low';
  end if;

  update public.progression
  set
    xp = xp - p_xp_amount,
    credits = credits + v_gained,
    xp_conversion_count = case when v_last = v_today then xp_conversion_count + 1 else 1 end,
    xp_conversion_date = v_today
  where user_id = v_uid;

  select xp, credits into v_xp, v_credits from public.progression where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'xp', v_xp,
    'credits', v_credits,
    'xp_spent', p_xp_amount,
    'credits_gained', v_gained,
    'conversions_remaining', greatest(0, v_daily_limit - (
      case when v_last = v_today then v_count + 1 else 1 end
    ))
  );
end;
$$;

grant execute on function public.convert_xp_to_credits_guarded(int) to authenticated;

-- Activate consumable (deduct inventory, apply boost)
create or replace function public.use_consumable_guarded(
  p_item_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_qty int;
  v_effect text;
  v_boosts jsonb;
  v_new_boost jsonb;
  v_duration_ms int;
  v_uses int;
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select quantity into v_qty
  from public.player_inventory
  where user_id = v_uid and item_key = p_item_key
  for update;

  if v_qty is null or v_qty < 1 then
    raise exception 'item not in inventory';
  end if;

  select effect_type into v_effect
  from public.item_catalog
  where key = p_item_key and effect_type is not null;

  if v_effect is null then
    raise exception 'item is not activatable';
  end if;

  -- Duration / uses by effect (mirrors shopItemEffects config)
  v_duration_ms := case p_item_key
    when 'unlimited-mistakes' then 15 * 60 * 1000
    when 'xp-booster-small' then 15 * 60 * 1000
    when 'xp-booster-major' then 30 * 60 * 1000
    when 'xp-booster-insane' then 15 * 60 * 1000
    when 'stat-buffer-int' then 20 * 60 * 1000
    when 'stat-buffer-focus' then 20 * 60 * 1000
    else null
  end;

  v_uses := case
    when p_item_key in (
      'rank-shield', 'system-breach', 'reward-amplifier', 'quest-retry-ticket',
      'skip-token', 'revive-token', 'escape-beacon', 'time-freeze', 'title-unbroken'
    ) then 1
    else null
  end;

  if v_duration_ms is not null then
    v_expires := now() + (v_duration_ms || ' milliseconds')::interval;
  else
    v_expires := null;
  end if;

  v_new_boost := jsonb_build_object(
    'effectType', v_effect,
    'itemKey', p_item_key,
    'expiresAt', v_expires,
    'usesRemaining', v_uses
  );

  select active_boosts into v_boosts
  from public.progression
  where user_id = v_uid
  for update;

  -- Stack prevention for timed XP / mistake shields
  if v_effect in ('XP_BOOST', 'MISTAKE_SHIELD') then
    v_boosts := (
      select coalesce(jsonb_agg(elem), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_boosts, '[]'::jsonb)) elem
      where elem->>'effectType' is distinct from v_effect
    );
  end if;

  v_boosts := coalesce(v_boosts, '[]'::jsonb) || jsonb_build_array(v_new_boost);

  update public.progression
  set active_boosts = v_boosts
  where user_id = v_uid;

  if v_qty <= 1 then
    delete from public.player_inventory
    where user_id = v_uid and item_key = p_item_key;
  else
    update public.player_inventory
    set quantity = quantity - 1
    where user_id = v_uid and item_key = p_item_key;
  end if;

  return jsonb_build_object(
    'ok', true,
    'item_key', p_item_key,
    'boost', v_new_boost,
    'active_boosts', v_boosts
  );
end;
$$;

grant execute on function public.use_consumable_guarded(text) to authenticated;

-- Purchase with rotation + discount validation
create or replace function public.purchase_item_guarded(
  p_item_key text,
  p_quantity int default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_price int;
  v_total int;
  v_credits int;
  v_used int;
  v_capacity constant int := 99;
  v_today date := (timezone('utc', now()))::date;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'invalid quantity';
  end if;

  v_price := public.effective_shop_price(p_item_key, v_uid, v_today);

  if v_price is null then
    raise exception 'item not for sale';
  end if;

  v_total := v_price * p_quantity;

  select credits into v_credits
  from public.progression
  where user_id = v_uid
  for update;

  if v_credits < v_total then
    raise exception 'insufficient credits';
  end if;

  select coalesce(sum(quantity), 0) into v_used
  from public.player_inventory
  where user_id = v_uid;

  if v_used + p_quantity > v_capacity then
    raise exception 'inventory full';
  end if;

  update public.progression
  set credits = credits - v_total
  where user_id = v_uid;

  perform public.grant_inventory_items(
    jsonb_build_array(jsonb_build_object('itemKey', p_item_key, 'quantity', p_quantity))
  );

  select credits into v_credits from public.progression where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'credits', v_credits,
    'item_key', p_item_key,
    'quantity', p_quantity,
    'spent', v_total,
    'unit_price', v_price
  );
end;
$$;

grant execute on function public.purchase_item_guarded(text, int) to authenticated;
