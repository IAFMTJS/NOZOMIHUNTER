# Reference Mockup Integration Map

Last updated: 2026-05-24

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
