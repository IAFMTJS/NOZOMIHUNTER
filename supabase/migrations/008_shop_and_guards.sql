-- Shop, server daily stamina regen, starter loadout

alter table public.progression
  add column if not exists last_stamina_regen_date date;

alter table public.item_catalog
  add column if not exists credit_price int check (credit_price is null or credit_price >= 0);

update public.item_catalog set credit_price = 15 where key = 'shadow-shard' and credit_price is null;
update public.item_catalog set credit_price = 25 where key = 'signal-cache' and credit_price is null;
update public.item_catalog set credit_price = 120 where key = 'hunter-blade' and credit_price is null;
update public.item_catalog set credit_price = 90 where key = 'echo-ring' and credit_price is null;
update public.item_catalog set credit_price = 35 where key = 'recovery-draft' and credit_price is null;
update public.item_catalog set credit_price = 10 where key = 'data-scroll' and credit_price is null;

-- Server-authoritative daily stamina (once per UTC calendar day)
create or replace function public.apply_daily_stamina_guarded()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_last date;
  v_stamina int;
  v_max int;
  v_new int;
  v_regen constant int := 100;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select last_stamina_regen_date, stamina, stamina_max
  into v_last, v_stamina, v_max
  from public.progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'progression missing';
  end if;

  if v_last = v_today then
    return jsonb_build_object('ok', true, 'regenned', false, 'stamina', v_stamina);
  end if;

  v_new := least(coalesce(v_max, 100), coalesce(v_stamina, 0) + v_regen);

  update public.progression
  set stamina = v_new, last_stamina_regen_date = v_today
  where user_id = v_uid;

  return jsonb_build_object('ok', true, 'regenned', true, 'stamina', v_new);
end;
$$;

grant execute on function public.apply_daily_stamina_guarded() to authenticated;

-- Purchase from shop (credits → inventory)
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
  v_stackable boolean;
  v_used int;
  v_capacity constant int := 99;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'invalid quantity';
  end if;

  select credit_price, stackable into v_price, v_stackable
  from public.item_catalog
  where key = p_item_key;

  if not found or v_price is null then
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
    'spent', v_total
  );
end;
$$;

grant execute on function public.purchase_item_guarded(text, int) to authenticated;

-- Starter loadout: consumable + equipable blade (auto-equipped)
create or replace function public.seed_starter_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_inventory (user_id, item_key, quantity, equipped)
  values
    (new.id, 'recovery-draft', 2, false),
    (new.id, 'shadow-shard', 1, false),
    (new.id, 'hunter-blade', 1, true)
  on conflict do nothing;
  return new;
end;
$$;
