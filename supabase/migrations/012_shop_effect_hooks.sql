-- Consume one use from an active boost (server-authoritative)

create or replace function public.consume_active_boost_guarded(
  p_effect_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_boosts jsonb;
  v_elem jsonb;
  v_new jsonb := '[]'::jsonb;
  v_found boolean := false;
  v_uses int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select active_boosts into v_boosts
  from public.progression
  where user_id = v_uid
  for update;

  if v_boosts is null or jsonb_array_length(v_boosts) = 0 then
    raise exception 'no active boosts';
  end if;

  for v_elem in select * from jsonb_array_elements(v_boosts)
  loop
    if v_elem->>'effectType' = p_effect_type and not v_found then
      v_found := true;
      v_uses := (v_elem->>'usesRemaining')::int;
      if v_uses is null then
        raise exception 'boost is not consumable';
      end if;
      v_uses := v_uses - 1;
      if v_uses > 0 then
        v_new := v_new || jsonb_build_array(
          jsonb_set(v_elem, '{usesRemaining}', to_jsonb(v_uses))
        );
      end if;
    else
      v_new := v_new || jsonb_build_array(v_elem);
    end if;
  end loop;

  if not v_found then
    raise exception 'boost not active';
  end if;

  update public.progression
  set active_boosts = v_new
  where user_id = v_uid;

  return jsonb_build_object('ok', true, 'active_boosts', v_new);
end;
$$;

grant execute on function public.consume_active_boost_guarded(text) to authenticated;

-- Reactivate a failed quest snapshot
create or replace function public.reactivate_failed_quest_guarded(
  p_quest_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_quests%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_row
  from public.user_quests
  where user_id = v_uid
    and status = 'failed'
    and (quest_snapshot->>'id') = p_quest_id
  order by updated_at desc
  limit 1
  for update;

  if not found then
    raise exception 'failed quest not found';
  end if;

  update public.user_quests
  set status = 'active', updated_at = now()
  where id = v_row.id;

  return jsonb_build_object('ok', true, 'quest_id', p_quest_id);
end;
$$;

grant execute on function public.reactivate_failed_quest_guarded(text) to authenticated;
