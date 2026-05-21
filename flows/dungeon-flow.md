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
EXTRACTION — claim XP + unlocks
↓
DUNGEON_COMPLETED

Failure paths:
- Sector failure increments `encounterFailures`; at max → dungeon fail + penalties
- Abort dungeon → fail contract

Events:
- `DUNGEON_ENTERED`
- `ENCOUNTER_STARTED`
- `ENCOUNTER_COMPLETED`
- `DUNGEON_COMPLETED`
- `DUNGEON_FAILED`

Persistence: `user_quests.quest_snapshot` + `progress.dungeonRun`
