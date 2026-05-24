-- Sell inventory items back for credits (50% of catalog base price)

create or replace function public.nozomi_sell_unit_price(p_base_price int)
returns int
language sql
immutable
as $$
  select greatest(1, (p_base_price * 50) / 100);
$$;

create or replace function public.sell_item_guarded(
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
  v_qty int;
  v_equipped boolean;
  v_base_price int;
  v_unit_sell int;
  v_total int;
  v_credits int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'invalid quantity';
  end if;

  select credit_price into v_base_price
  from public.item_catalog
  where key = p_item_key;

  if v_base_price is null or v_base_price <= 0 then
    raise exception 'item cannot be sold';
  end if;

  v_unit_sell := public.nozomi_sell_unit_price(v_base_price);
  v_total := v_unit_sell * p_quantity;

  select quantity, coalesce(equipped, false)
  into v_qty, v_equipped
  from public.player_inventory
  where user_id = v_uid and item_key = p_item_key
  for update;

  if v_qty is null or v_qty < p_quantity then
    raise exception 'insufficient quantity';
  end if;

  if v_equipped then
    raise exception 'unequip item before selling';
  end if;

  if v_qty <= p_quantity then
    delete from public.player_inventory
    where user_id = v_uid and item_key = p_item_key;
  else
    update public.player_inventory
    set quantity = quantity - p_quantity
    where user_id = v_uid and item_key = p_item_key;
  end if;

  update public.progression
  set credits = credits + v_total
  where user_id = v_uid;

  select credits into v_credits from public.progression where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'credits', v_credits,
    'item_key', p_item_key,
    'quantity', p_quantity,
    'gained', v_total,
    'unit_price', v_unit_sell
  );
end;
$$;

grant execute on function public.sell_item_guarded(text, int) to authenticated;
