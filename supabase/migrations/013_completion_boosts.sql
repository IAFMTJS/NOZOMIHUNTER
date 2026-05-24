-- Server-authoritative completion rewards, catalog effect columns, consumable refactor

alter table public.item_catalog
  add column if not exists effect_duration_ms int,
  add column if not exists effect_uses int,
  add column if not exists effect_xp_multiplier numeric,
  add column if not exists title_unlock_key text,
  add column if not exists aura_key text;

-- Seed effect metadata (mirrors shopItemEffects.ts)
update public.item_catalog set effect_duration_ms = 900000, effect_uses = null, effect_xp_multiplier = null where key = 'unlimited-mistakes';
update public.item_catalog set effect_duration_ms = 900000, effect_uses = null, effect_xp_multiplier = 1.25 where key = 'xp-booster-small';
update public.item_catalog set effect_duration_ms = 1800000, effect_uses = null, effect_xp_multiplier = 1.5 where key = 'xp-booster-major';
update public.item_catalog set effect_duration_ms = 900000, effect_uses = null, effect_xp_multiplier = 2 where key = 'xp-booster-insane';
update public.item_catalog set effect_duration_ms = 1200000, effect_uses = null where key in ('stat-buffer-int', 'stat-buffer-focus');
update public.item_catalog set effect_duration_ms = null, effect_uses = 1 where key in (
  'rank-shield', 'system-breach', 'reward-amplifier', 'quest-retry-ticket',
  'skip-token', 'revive-token', 'escape-beacon', 'time-freeze', 'title-unbroken'
);
update public.item_catalog set effect_duration_ms = null, effect_uses = null, aura_key = 'shadow' where key = 'aura-shadow';
update public.item_catalog set effect_duration_ms = null, effect_uses = null, aura_key = 'motion' where key = 'aura-divine';
update public.item_catalog set title_unlock_key = 'title:the-unbroken' where key = 'title-unbroken';

create or replace function public.nozomi_fatigue_xp_multiplier(p_fatigue int)
returns numeric
language plpgsql
immutable
as $$
declare
  v_reduction numeric;
begin
  v_reduction := coalesce(p_fatigue, 0) * 0.02;
  return greatest(0.5, 1.0 - v_reduction);
end;
$$;

create or replace function public.nozomi_boost_is_active(p_boost jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  v_expires timestamptz;
  v_uses int;
begin
  if p_boost is null then
    return false;
  end if;
  v_expires := nullif(p_boost->>'expiresAt', '')::timestamptz;
  if v_expires is not null and v_expires <= now() then
    return false;
  end if;
  if p_boost ? 'usesRemaining' and p_boost->>'usesRemaining' is not null then
    v_uses := (p_boost->>'usesRemaining')::int;
    if v_uses <= 0 then
      return false;
    end if;
  end if;
  return true;
end;
$$;

create or replace function public.nozomi_has_active_boost(p_boosts jsonb, p_effect_type text)
returns boolean
language plpgsql
stable
as $$
declare
  v_elem jsonb;
begin
  if p_boosts is null then
    return false;
  end if;
  for v_elem in select * from jsonb_array_elements(p_boosts)
  loop
    if v_elem->>'effectType' = p_effect_type
       and public.nozomi_boost_is_active(v_elem) then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create or replace function public.nozomi_xp_boost_multiplier(p_boosts jsonb)
returns numeric
language plpgsql
stable
as $$
declare
  v_elem jsonb;
  v_key text;
  v_mult numeric := 1;
  v_item_mult numeric;
begin
  if p_boosts is null then
    return 1;
  end if;
  for v_elem in select * from jsonb_array_elements(p_boosts)
  loop
    if v_elem->>'effectType' = 'XP_BOOST'
       and public.nozomi_boost_is_active(v_elem) then
      v_key := v_elem->>'itemKey';
      select coalesce(effect_xp_multiplier, 1) into v_item_mult
      from public.item_catalog
      where key = v_key;
      v_mult := greatest(v_mult, coalesce(v_item_mult, 1));
    end if;
  end loop;
  return v_mult;
end;
$$;

create or replace function public.nozomi_tier_rewards(p_level int, p_is_main boolean)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_xp int;
  v_credits int;
begin
  if coalesce(p_is_main, false) then
    v_xp := case
      when p_level < 5 then 70
      when p_level < 15 then 90
      else 110
    end;
    v_credits := 20 + p_level * 3;
  else
    v_xp := case
      when p_level < 5 then 50
      when p_level < 15 then 65
      else 80
    end;
    v_credits := 8 + p_level * 2;
  end if;
  return jsonb_build_object('xp', v_xp, 'credits', v_credits);
end;
$$;

create or replace function public.nozomi_is_boss_snapshot(p_snapshot jsonb)
returns boolean
language plpgsql
immutable
as $$
begin
  return coalesce(p_snapshot->'dungeonRun'->>'activeType', '') = 'BOSS'
    or coalesce(p_snapshot->'dungeonRun'->>'machineState', '') = 'BOSS';
end;
$$;

create or replace function public.nozomi_consume_boosts(
  p_boosts jsonb,
  p_effect_types text[]
)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_elem jsonb;
  v_new jsonb := '[]'::jsonb;
  v_effect text;
  v_uses int;
  v_consume boolean;
begin
  if p_boosts is null then
    return '[]'::jsonb;
  end if;
  for v_elem in select * from jsonb_array_elements(p_boosts)
  loop
    v_effect := v_elem->>'effectType';
    v_consume := v_effect = any(p_effect_types);
    if v_consume and v_elem ? 'usesRemaining' and v_elem->>'usesRemaining' is not null then
      v_uses := (v_elem->>'usesRemaining')::int - 1;
      if v_uses > 0 then
        v_new := v_new || jsonb_build_array(
          jsonb_set(v_elem, '{usesRemaining}', to_jsonb(v_uses))
        );
      end if;
    elsif not v_consume then
      v_new := v_new || jsonb_build_array(v_elem);
    end if;
  end loop;
  return v_new;
end;
$$;

create or replace function public.nozomi_apply_completion_rewards(
  p_base_xp int,
  p_base_credits int,
  p_fatigue int,
  p_level int,
  p_snapshot jsonb,
  p_boosts jsonb
)
returns jsonb
language plpgsql
stable
as $$
declare
  v_xp numeric;
  v_credits numeric;
  v_difficulty text;
  v_is_main boolean;
  v_tier jsonb;
  v_override_mult constant numeric := 1.4;
  v_consume text[] := '{}';
begin
  v_xp := greatest(0, coalesce(p_base_xp, 0));
  v_credits := greatest(0, coalesce(p_base_credits, 0));

  v_difficulty := coalesce(p_snapshot->>'difficulty', 'NORMAL');
  v_is_main := coalesce(p_snapshot->>'narrativeTier', 'SIDE') = 'MAIN';

  if public.nozomi_has_active_boost(p_boosts, 'DIFFICULTY_OVERRIDE')
     and not public.nozomi_is_boss_snapshot(p_snapshot)
     and coalesce((p_snapshot->>'isTutorial')::boolean, false) = false
     and v_difficulty in ('EASY', 'NORMAL') then
    v_tier := public.nozomi_tier_rewards(p_level, v_is_main);
    v_xp := greatest(v_xp, floor((v_tier->>'xp')::numeric * v_override_mult));
    v_credits := greatest(v_credits, floor((v_tier->>'credits')::numeric * v_override_mult));
    v_consume := array_append(v_consume, 'DIFFICULTY_OVERRIDE');
  end if;

  v_xp := v_xp * public.nozomi_fatigue_xp_multiplier(p_fatigue);
  v_credits := v_credits * public.nozomi_fatigue_xp_multiplier(p_fatigue);

  v_xp := v_xp * public.nozomi_xp_boost_multiplier(p_boosts);

  if public.nozomi_has_active_boost(p_boosts, 'REWARD_AMPLIFIER') then
    v_xp := v_xp * 2;
    v_credits := v_credits * 2;
    v_consume := array_append(v_consume, 'REWARD_AMPLIFIER');
  end if;

  return jsonb_build_object(
    'xp', greatest(0, floor(v_xp)::int),
    'credits', greatest(0, floor(v_credits)::int),
    'consume', to_jsonb(v_consume)
  );
end;
$$;

create or replace function public.complete_quest_guarded(
  p_quest_id text,
  p_xp_claimed int default 0
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
  v_credits_grant int;
  v_old_xp int;
  v_old_level int;
  v_new_xp int;
  v_new_level int;
  v_new_rank text;
  v_max_grant constant int := 500;
  v_pending jsonb;
  v_fatigue int;
  v_level int;
  v_boosts jsonb;
  v_new_boosts jsonb;
  v_applied jsonb;
  v_consume jsonb;
  v_effect text;
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
    if coalesce((v_objective->>'hidden')::boolean, false) then
      continue;
    end if;
    if coalesce((v_objective->>'currentProgress')::int, 0)
       < coalesce((v_objective->>'requiredProgress')::int, 1) then
      raise exception 'quest objectives not complete';
    end if;
  end loop;

  v_reward_xp := coalesce((v_snapshot->'rewards'->>'xp')::int, 0);
  v_reward_credits := coalesce((v_snapshot->'rewards'->>'credits')::int, 0);
  v_reward_items := coalesce(v_snapshot->'rewards'->'items', '[]'::jsonb);

  select xp, level, active_boosts
  into v_old_xp, v_level, v_boosts
  from public.progression
  where user_id = v_uid
  for update;

  select fatigue into v_fatigue
  from public.player_penalties
  where user_id = v_uid;

  v_applied := public.nozomi_apply_completion_rewards(
    v_reward_xp,
    v_reward_credits,
    coalesce(v_fatigue, 0),
    coalesce(v_level, 1),
    v_snapshot,
    coalesce(v_boosts, '[]'::jsonb)
  );

  v_xp_grant := least(
    (v_applied->>'xp')::int,
    v_max_grant
  );
  v_credits_grant := (v_applied->>'credits')::int;

  v_consume := v_applied->'consume';
  v_new_boosts := v_boosts;
  if v_consume is not null and jsonb_array_length(v_consume) > 0 then
    for v_effect in select jsonb_array_elements_text(v_consume)
    loop
      v_new_boosts := public.nozomi_consume_boosts(v_new_boosts, array[v_effect]);
    end loop;
  end if;

  v_new_xp := v_old_xp + v_xp_grant;
  v_new_level := public.nozomi_level_from_xp(v_new_xp);
  v_new_rank := public.nozomi_rank_from_level(v_new_level);

  v_pending := jsonb_build_object(
    'xpGained', v_xp_grant,
    'credits', v_credits_grant,
    'items', v_reward_items,
    'questId', p_quest_id,
    'claimed', false,
    'boostsConsumed', coalesce(v_consume, '[]'::jsonb)
  );

  update public.progression
  set
    xp = v_new_xp,
    level = v_new_level,
    rank = v_new_rank,
    credits = credits + v_credits_grant,
    active_boosts = coalesce(v_new_boosts, v_boosts),
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
    'credits_gained', v_credits_grant,
    'previous_xp', v_old_xp,
    'previous_level', v_level,
    'pending_rewards', v_pending,
    'boosts_consumed', coalesce(v_consume, '[]'::jsonb)
  );
end;
$$;

-- Catalog-driven consumable activation + title unlock
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
  v_duration_ms int;
  v_uses int;
  v_title_key text;
  v_boosts jsonb;
  v_new_boost jsonb;
  v_expires timestamptz;
  v_titles jsonb;
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

  select effect_type, effect_duration_ms, effect_uses, title_unlock_key
  into v_effect, v_duration_ms, v_uses, v_title_key
  from public.item_catalog
  where key = p_item_key and effect_type is not null;

  if v_effect is null then
    raise exception 'item is not activatable';
  end if;

  if v_duration_ms is not null then
    v_expires := now() + (v_duration_ms || ' milliseconds')::interval;
  else
    v_expires := null;
  end if;

  if v_effect = 'TITLE_UNLOCK' and v_title_key is not null then
    select coalesce(titles, '[]'::jsonb) into v_titles
    from public.progression
    where user_id = v_uid
    for update;

    if not v_titles @> jsonb_build_array(v_title_key) then
      update public.progression
      set titles = coalesce(titles, '[]'::jsonb) || jsonb_build_array(v_title_key)
      where user_id = v_uid;
    end if;
  elsif v_effect not in ('TITLE_UNLOCK', 'COSMETIC_AURA') then
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

    if v_effect in ('XP_BOOST', 'MISTAKE_SHIELD') then
      v_boosts := (
        select coalesce(jsonb_agg(elem), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_boosts, '[]'::jsonb)) elem
        where elem->>'effectType' is distinct from v_effect
      );
    end if;

    update public.progression
    set active_boosts = coalesce(v_boosts, '[]'::jsonb) || jsonb_build_array(v_new_boost)
    where user_id = v_uid;
  elsif v_effect = 'COSMETIC_AURA' then
    select aura_key into v_title_key from public.item_catalog where key = p_item_key;
    v_new_boost := jsonb_build_object(
      'effectType', v_effect,
      'itemKey', p_item_key,
      'expiresAt', null,
      'usesRemaining', null,
      'metadata', jsonb_build_object('auraKey', coalesce(v_title_key, 'shadow'))
    );
    select active_boosts into v_boosts from public.progression where user_id = v_uid for update;
    update public.progression
    set active_boosts = coalesce(v_boosts, '[]'::jsonb) || jsonb_build_array(v_new_boost)
    where user_id = v_uid;
  end if;

  if v_qty <= 1 then
    delete from public.player_inventory
    where user_id = v_uid and item_key = p_item_key;
  else
    update public.player_inventory
    set quantity = quantity - 1
    where user_id = v_uid and item_key = p_item_key;
  end if;

  select active_boosts into v_boosts from public.progression where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'item_key', p_item_key,
    'boost', v_new_boost,
    'active_boosts', v_boosts,
    'title_unlocked', v_title_key
  );
end;
$$;

grant execute on function public.complete_quest_guarded(text, int) to authenticated;
