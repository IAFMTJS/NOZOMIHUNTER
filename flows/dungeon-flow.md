# Dungeon Flow (Phase 5)

Enter Dungeon (DUNGEON quest assigned)
↓
PREPARATION — briefing, Deploy
↓
EXPLORATION — Enter sector
↓
ENCOUNTER — vocab / listening / NPC / speech
↓
REWARD — sector cleared
↓
(repeat sectors)
↓
BOSS — vocabulary phase → speech phase
↓
EXTRACTION — `ExtractionCeremony` (breach → sync → extract) + themed audio
↓
`resolveRewardProgression` — merge dungeon reward unlocks, `UNLOCK_GRANTED`
↓
DUNGEON_COMPLETED

Corridors: all definitions shown in sector hub; `resolveDungeonAccess` (level, prerequisite unlock, active run).

Failure paths:
- Sector failure increments `encounterFailures`; max budget from `maxDungeonEncounterFailures` (corruption ≥ 40 → 1 failure allowed)
- Abort dungeon → fail contract

Events:
- `DUNGEON_ENTERED`
- `ENCOUNTER_STARTED`
- `ENCOUNTER_COMPLETED`
- `ENCOUNTER_ANSWER_CORRECT` / `ENCOUNTER_ANSWER_WRONG` (sector encounters)
- `DUNGEON_COMPLETED`
- `DUNGEON_FAILED`

UI (v0.6.7): `DungeonPhaseStepper`, `DungeonCorridorRail`, hunt-mode focus during ENCOUNTER/BOSS; audio cues via event bus.

Persistence: `user_quests.quest_snapshot` + `progress.dungeonRun`
