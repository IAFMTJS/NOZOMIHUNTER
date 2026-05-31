-- Remediation: game mode action guard + quest reward XP clamp helper

create or replace function public.nozomi_clamp_quest_reward_xp(p_xp int)
returns int
language plpgsql
immutable
as $$
begin
  return greatest(0, least(coalesce(p_xp, 0), 500));
end;
$$;

create or replace function public.apply_game_mode_action_guarded(
  p_quest_id text,
  p_action text,
  p_payload text,
  p_next_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_quests%rowtype;
  v_current jsonb;
  v_target_id text;
  v_ok_raw text;
  v_stability int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not public.check_player_rate_limit('game_mode_action', 60, 60000) then
    raise exception 'game mode action rate limit';
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

  v_current := v_row.quest_snapshot;

  if (p_next_snapshot->>'id') is distinct from p_quest_id then
    raise exception 'snapshot quest id mismatch';
  end if;

  if p_action = 'kanji-stabilize' then
    v_target_id := split_part(coalesce(p_payload, ''), ':', 1);
    v_ok_raw := split_part(coalesce(p_payload, ''), ':', 2);
    if v_target_id = '' then
      raise exception 'kanji target required';
    end if;
    if v_ok_raw = 'true' then
      select coalesce((elem->>'stability')::int, 0) into v_stability
      from jsonb_array_elements(coalesce(v_current->'kanjiSurgeryEncounter', '[]'::jsonb)) elem
      where elem->>'id' = v_target_id
      limit 1;
      if v_stability is null then
        raise exception 'unknown kanji target';
      end if;
      if v_stability >= 100 then
        raise exception 'target already stabilized';
      end if;
    end if;
  end if;

  update public.user_quests
  set quest_snapshot = p_next_snapshot,
      updated_at = now()
  where id = v_row.id;

  return jsonb_build_object('ok', true, 'quest_id', p_quest_id);
end;
$$;

grant execute on function public.apply_game_mode_action_guarded(text, text, text, jsonb) to authenticated;

-- Clamp declared reward XP before completion math (passive boost cap enforced client-side too)
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

  v_reward_xp := public.nozomi_clamp_quest_reward_xp(
    coalesce((v_snapshot->'rewards'->>'xp')::int, 0)
  );
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
