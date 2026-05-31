# Navigation Flow

## Authenticated shell

1. User signs in → `/home`
2. `HunterSessionProvider` hydrates player + quests once
3. `BottomNav` routes (5 tabs): `/home`, `/contracts` (label **Missions**), `/dungeons`, `/vocabulary` (label **Threat index**), `/profile`
4. Secondary routes (header/back, not in tab bar): `/prepare`, `/training`, `/system`, `/stats`, `/settings`, `/records`, `/achievements`
5. `/dashboard` redirects to `/home` (PWA `start_url` is `/home`)

## Mission flow

`/contracts` (catalog) → `/contracts/[id]` → Track → `/prepare?questId=` → Deploy → `/contracts` + `EncounterHost` hunt overlay (`hubView === "hunt"`)

Browsing `/contracts` shows `ContractsClient` only. The overlay appears after deploy from `/prepare`, not when the URL is merely `/contracts`.

Story tab links include `?tab=story` (or `daily` / `side`) so contract detail breadcrumbs match the catalog channel. Completed story files resolve from completed quest snapshots and open read-only (no deploy CTA).

**Training drills:** `/training` → Play → `/prepare?questId=` → Deploy → `/training` + hunt overlay (`hubView === "hunt"`, `hubFocusQuestId` set). Play does **not** open the overlay early (avoids showing an active Neon Corridor run). Critical readiness bypass applies on deploy only.

Legacy: `/missions` and `/missions/[id]` redirect to `/contracts`.

## Dungeon flow

`/dungeons` (list) → `/dungeons/[key]` → Enter (stamina RPC) → `/prepare?dungeonKey=` → Deploy → `/dungeons` + `EncounterHost` sector overlay (`hubView === "sector"`)

**Stuck run recovery:** With an active run, browsing `/dungeons` keeps the **list visible** (overlay does not auto-open). Use **Resume corridor** to reopen the sector overlay, **Abandon active run** on the list, or **Abort dungeon** inside the run (including `PREPARATION` before sector deploy). Stable `data-testid` hooks live in `src/config/e2eTestIds.ts`.

**V2 route from REWARD:** After a sector reward, route selection uses `REWARD → EXPLORATION` then engages the chosen node (no direct `REWARD → ENCOUNTER` transition).

Leaving `/contracts`, `/missions`, or `/dungeons` (e.g. bottom nav) resets `hubView` to `menu` and hides the overlay so each route renders its own page.

## Auth and session

- Protected routes include `/settings`, `/training`, and `/records` (middleware).
- Session gate: `HunterSessionProvider` waits for auth, then player hydration; on failure shows **Retry sync** (`hydrate-error` phase).
- Guest login only when `NEXT_PUBLIC_ENABLE_GUEST_AUTH=true` and Supabase anonymous auth is enabled (see README).

## Hub overlay views

`ContractHub` supports internal views: `menu`, `hunt`, `contracts`, `sector`. `EncounterHost` mounts the full hub overlay when `hubView` is `hunt` or `sector` on `/contracts`, `/missions`, `/dungeons`, or `/training`. The `menu` view is used in-session when not in an active encounter; it is not mounted as a route overlay by default.

## World map and archive

- `/map` — sector map (`WorldMapClient`, `worldMapSystem`)
- `/archive` — Black Archive lore entries (`ArchiveClient`, `archiveSystem`)
- `/contacts` — NPC trust summary (`ContactsClient`, `relationshipRepository`)

Linked from Profile → modules.

## Overlays

- `RewardClaimOverlay` when `player.pendingRewards` is set after guarded completion (tier: daily light / side medium / story+dungeon full — see `completionCeremonyTierSystem`)
- `LevelUpCeremony` (fullscreen slam) when `usePlayerStore.levelUpCeremony` is set — suppresses duplicate level toast in `ReactiveFeedbackHost`
- `AchievementUnlockCeremony` when a new achievement unlock is detected (queued in `HunterSessionContext`)
- `RankUpNotice` / `UnlockNotice` for rank and registry unlocks
- `SyncDisciplineCeremony` for discipline-chain milestones (localStorage-gated)

See [gamefeel-ceremonies.md](gamefeel-ceremonies.md).
