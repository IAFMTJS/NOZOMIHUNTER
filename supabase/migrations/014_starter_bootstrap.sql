-- Starter progression + inventory for new hunters
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Hunter'));

  insert into public.player_stats (user_id) values (new.id);
  insert into public.progression (
    user_id,
    unlocked_dungeons,
    unlocked_systems
  ) values (
    new.id,
    '["dungeon:neon-corridor"]'::jsonb,
    '["quests", "home", "bootstrap:starter-pack"]'::jsonb
  );
  insert into public.player_penalties (user_id) values (new.id);

  insert into public.player_inventory (user_id, item_key, quantity, equipped) values
    (new.id, 'recovery-draft', 2, false),
    (new.id, 'shadow-shard', 1, false),
    (new.id, 'hunter-blade', 1, true)
  on conflict do nothing;

  return new;
end;
$$;
