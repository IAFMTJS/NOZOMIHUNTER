# Navigation Flow

## Authenticated shell

1. User signs in → `/home`
2. `HunterSessionProvider` hydrates player + quests once
3. `BottomNav` routes: `/home`, `/contracts` (label **Missions**), `/dungeons`, `/vocabulary`, `/profile`
4. Secondary routes (header/back, not in tab bar): `/prepare`, `/vocabulary`, `/system`, `/stats`, `/settings`, `/records`, `/achievements`
5. `/dashboard` redirects to `/home` (PWA `start_url` is `/home`)

## Mission flow

`/contracts` (catalog) → `/contracts/[id]` → Track → `/prepare?questId=` → Deploy → `/contracts` + `EncounterHost` hunt overlay (`hubView === "hunt"`)

Browsing `/contracts` shows `ContractsClient` only. The overlay appears after deploy from `/prepare`, not when the URL is merely `/contracts`.

Legacy: `/missions` and `/missions/[id]` redirect to `/contracts`.

## Dungeon flow

`/dungeons` (list) → `/dungeons/[key]` → Enter (stamina RPC) → `/prepare?dungeonKey=` → Deploy → `/dungeons` + `EncounterHost` sector overlay (`hubView === "sector"`)

Leaving `/contracts`, `/missions`, or `/dungeons` (e.g. bottom nav) resets `hubView` to `menu` and hides the overlay so each route renders its own page.

## Overlays

- `RewardClaimOverlay` when `player.pendingRewards` is set after guarded completion (tier: daily light / side medium / story+dungeon full — see `completionCeremonyTierSystem`)
- `LevelUpCeremony` (fullscreen slam) when `usePlayerStore.levelUpCeremony` is set — suppresses duplicate level toast in `ReactiveFeedbackHost`
- `AchievementUnlockCeremony` when a new achievement unlock is detected (queued in `HunterSessionContext`)
- `RankUpNotice` / `UnlockNotice` for rank and registry unlocks
- `SyncDisciplineCeremony` for discipline-chain milestones (localStorage-gated)

See [gamefeel-ceremonies.md](gamefeel-ceremonies.md).
