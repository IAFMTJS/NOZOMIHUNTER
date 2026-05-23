-- Fix stamina unlock check (jsonb array contains) and refund helper

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
  v_allowed boolean;
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

  v_allowed :=
    p_dungeon_key is null
    or p_dungeon_key = 'dungeon:neon-corridor'
    or coalesce(v_unlocked, '[]'::jsonb) @> jsonb_build_array(p_dungeon_key);

  if not v_allowed then
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

create or replace function public.refund_stamina_guarded(p_amount int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_max int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_amount <= 0 then
    return jsonb_build_object('ok', true, 'refunded', 0);
  end if;

  select stamina_max into v_max from public.progression where user_id = v_uid;

  update public.progression
  set stamina = least(coalesce(v_max, 100), stamina + p_amount)
  where user_id = v_uid;

  return jsonb_build_object('ok', true, 'refunded', p_amount);
end;
$$;

grant execute on function public.refund_stamina_guarded(int) to authenticated;

-- Skip hidden objectives when validating quest completion
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
