# Dungeon Masters Flow

Sector intelligences overlay dungeon runs. Gameplay lives in `/systems/dungeons`; UI reads presentation DTOs only.

## Data

- Contract: `contracts/dungeon-master-contract.ts`
- Registry: `src/config/dungeonMastersConfig.ts`
- Dungeon mapping: `masterId` on `DungeonDefinitionConfig` and `DungeonContract`

## Dialogue moments

| Moment | Trigger |
|--------|---------|
| ENTRY | `deployDungeon` |
| ROUTE_CHOICE | `chooseDungeonRoute` |
| FIRST_MISTAKE | first wrong answer (v2) |
| STREAK | streak ≥ 3 |
| CORRUPTION | corruption crosses 50 / 75 |
| BOSS_AWARENESS | awareness tier cross |
| BOSS_PHASE | `beginBossPhase` |
| EXTRACTION | extraction choice |
| FAILURE | `failDungeonRun` |
| PERFECT_CLEAR | `finalizeDungeonExtraction` when clean |
| REMATCH | deploy when relationship > OBSERVING |

Lines stored on `DungeonRunContract.masterDialogueLine`.

## Awareness → presence

`bossAwareness` thresholds (25 / 50 / 75 / 100) drive `DungeonMasterPresence` CSS tiers and domain backdrop intensity.

## Master rules (MVP)

| Rule | Master | Hook |
|------|--------|------|
| gate-protocol | Neon Warden | high-danger route choice |
| memory-debt | Archivist | vocab word picker |
| signal-decay | Broadcast Spirit | listening replay |
| hunger | Gate Devourer | wrong / streak |
| reflection | Mirror Hunter | vocab bias |
| collapse-hunger | Collapse Echo | threat init at 50% corruption |

## Memory / rematch

- Relationship titles: `master:{id}:{state}` on `progression.titles`
- Perfect clear: display title + relic `itemKey` in inventory
- Rematch: `applyRematchModifierToRun` on `enterDungeon`

## Events

`DUNGEON_COMPLETED` payload may include `masterId`, `perfectClear`, `relationshipState`.
