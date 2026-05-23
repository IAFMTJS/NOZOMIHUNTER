# Navigation Flow

## Authenticated shell

1. User signs in → `/home`
2. `HunterSessionProvider` hydrates player + quests once
3. `BottomNav` routes: `/home`, `/contracts`, `/dungeons`, `/inventory`, `/profile`
4. Secondary routes (header/back, not in tab bar): `/prepare`, `/vocabulary`, `/system`
5. `/dashboard` redirects to `/home` (PWA `start_url` is `/home`)

## Mission flow

`/contracts` → `/contracts/[id]` → Track → `/prepare?questId=` → Deploy → `EncounterHost` (ContractHub hunt view)

Legacy: `/missions` and `/missions/[id]` redirect to `/contracts`.

## Dungeon flow

`/dungeons` → `/dungeons/[key]` → Enter (stamina RPC) → `/prepare?dungeonKey=` → Deploy → `EncounterHost` (sector view)

## Overlays

- `RewardClaimOverlay` when `player.pendingRewards` is set after guarded completion
- `LevelUpNotice` / `RankUpNotice` / `UnlockNotice` sequential after claim
