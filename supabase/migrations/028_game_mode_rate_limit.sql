-- Rate-limit game mode actions per player (anti-spoof flood).
-- Encounter validation remains in application layer (gameModeActionGuard.ts).

comment on function public.check_player_rate_limit is
  'Also used for game_mode_action limit: 60 actions per minute';
