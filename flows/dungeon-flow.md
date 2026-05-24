# Dungeon Flow (Phase 5+)

`/dungeons` → `/dungeons/[key]` → Enter (`spend_stamina_guarded`, migration 006)
↓
`/prepare?dungeonKey=` — readiness ring, power advisory, checklist
↓
Enter Dungeon (DUNGEON quest assigned)
↓
PREPARATION — briefing, Deploy (`initDungeonTimer` sets `runStartedAt` + `timeLimitMs`)
↓
EXPLORATION — corridor transit (APPROACH → SCAN → ENGAGE beats via `ExplorationLayer`); **Hold channel** LISTEN action requires ~1.8s press-and-hold before intel unlocks
↓
ENCOUNTER — vocab / listening / NPC / speech (after `engageSectorEncounter`)
↓
REWARD — sector cleared interstitial (`SectorRewardInterstitial`)
↓
EXPLORATION — next sector transit (repeat)
↓
BOSS — vocabulary phase → speech phase
↓
EXTRACTION — `DungeonClearCeremony` (slam title, sequential rewards, extract CTA) + themed audio
↓
Assign quest → `spend_stamina_guarded` (JSONB unlock check) → extract uses same `applyActivityCompletion` + `pending_rewards` as missions
↓
`RewardClaimOverlay` (if bundle staged)
↓
DUNGEON_COMPLETED

Corridors: all definitions shown in sector hub; `resolveDungeonAccess` (level, prerequisite unlock, active run).

Failure paths:
- Sector timer — `DungeonRunner` countdown; `assertDungeonTimedOut` on encounter submit and failure handler
- Sector failure increments `encounterFailures`; max budget from `maxDungeonEncounterFailures` (corruption ≥ 40 → 1 failure allowed)
- **Revive token** — one extra life in `handleDungeonFailure`
- **Escape beacon** — penalty-free abort in `abandonDungeon`
- **Time freeze** — extends deadline via `frozenTimeMs` / `frozenUntil`
- Abort dungeon (no beacon) → fail contract

Events:
- `DUNGEON_ENTERED`
- `ENCOUNTER_STARTED`
- `ENCOUNTER_COMPLETED`
- `ENCOUNTER_ANSWER_CORRECT` / `ENCOUNTER_ANSWER_WRONG` (sector encounters)
- `DUNGEON_COMPLETED`
- `DUNGEON_FAILED` — reactive toast with XP debt / corruption / streak consequence copy

UI (v0.6.7): `DungeonPhaseStepper`, `DungeonCorridorRail`, hunt-mode focus during ENCOUNTER/BOSS; audio cues via event bus.

Persistence: `user_quests.quest_snapshot` + `progress.dungeonRun`
