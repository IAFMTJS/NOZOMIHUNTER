# Reference Mockup Integration Map

Last updated: 2026-05-29 (GDD v2.0 mockup boards)

**Reference images:** [`assets/reference/board-1-command-node.png`](./assets/reference/board-1-command-node.png) · [`board-2-mode-identity.png`](./assets/reference/board-2-mode-identity.png) · [`board-3-dungeon-flow.png`](./assets/reference/board-3-dungeon-flow.png)

| GDD Vol 4 screen | Route | Primary UI |
|------------------|-------|------------|
| Home command node | `/home` | `ActiveObjectiveCard`, `SectorCorruptionCard`, `ProgressProximityRail`, `NpcMessageCard` |
| Training priority | `/training` | Hero today's priority + `ArcadeCard` grid |
| Contract detail | `/contracts/[id]` | `QuestFileDetail` (risk, claim CTA) |
| Dungeon combat | dungeon overlay | `BossEncounterHUD`, corruption bands |
| Relic loadout | `/inventory` | `RelicSlotsRail` |

**Holistic UI plan (quest list → detail → deploy → run → extraction):** [`quest-channel-ui-plan.md`](quest-channel-ui-plan.md)

| Mockup screen | Route | Systems |
|---------------|-------|---------|
| Home | `/home` | `systemMessagingSystem`, `synchronizationSystem`, `readinessSystem`, `dungeonForecastSystem`, `SyncDisciplineChestTeaser` |
| Contracts | `/contracts` | `contractCatalogSystem`, `questGenerator` |
| Contract detail | `/contracts/[id]` | `contractTrackingSystem`, objectives |
| Dungeons | `/dungeons` | `dungeonAccess`, `hunterPowerSystem`, `dungeonForecastSystem` |
| Dungeon detail / run | `/dungeons/[key]` | `staminaSystem`, `explorationSystem`, `dungeonOrchestrator` |
| Preparation | `/prepare` | `readinessSystem`, `preparationChecklistSystem` |
| Listening / encounters | `ListeningEncounter` + `ListeningFocusShell` | `listeningEncounterSystem` |
| Vocabulary | `/vocabulary` | `brewSystem`, `vocabularyThreatSystem` |
| Word detail | `/vocabulary/[id]` | `word_mastery`, mark learned |
| Inventory | `/inventory` | `inventorySystem`, `ItemTile` |
| Stats | `/stats` | `rpgStatsSystem`, `hunterPowerSystem` |
| XP & rewards | overlay | `rewardClaimSystem`, `RewardRow` |
| System status | `/system` | `penaltyPresentationSystem`, `SystemCrest` |
| Profile | `/profile` | `HunterProfilePanel`, links to `/records`, `/settings`, `/achievements` |
| Records | `/records` | `recordsRepository`, `recordsPresentationSystem` |
| Settings | `/settings` | local prefs (audio, reduced motion) |

## Migrations

- `006_economy_inventory.sql` — stamina, inventory, brew
- `010_rpg_stats.sql` — RPG core stats on progression
