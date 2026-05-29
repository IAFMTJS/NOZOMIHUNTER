-- Discipline spend (research unlocks, cosmetics) — guarded RPC only

create or replace function public.spend_discipline_guarded(
  p_amount int,
  p_sink text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_discipline int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'invalid discipline amount';
  end if;

  if p_sink is null or length(trim(p_sink)) = 0 then
    raise exception 'sink required';
  end if;

  select discipline into v_discipline
  from public.progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'progression missing';
  end if;

  if v_discipline < p_amount then
    raise exception 'insufficient discipline';
  end if;

  update public.progression
  set discipline = discipline - p_amount
  where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'discipline_spent', p_amount,
    'sink', p_sink
  );
end;
$$;

grant execute on function public.spend_discipline_guarded(int, text) to authenticated;
