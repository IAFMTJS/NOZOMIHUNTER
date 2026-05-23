# Reference Mockup Integration Map

Last updated: 2026-05-23

| Mockup screen | Route | Systems |
|---------------|-------|---------|
| Home | `/home` | `systemMessagingSystem`, `synchronizationSystem`, `readinessSystem`, `dungeonForecastSystem` |
| Contracts | `/contracts` | `missionCatalogSystem`, `questGenerator` |
| Contract detail | `/contracts/[id]` | `missionTrackingSystem`, objectives |
| Dungeons | `/dungeons` | `dungeonAccess`, `hunterPowerSystem` |
| Dungeon detail | `/dungeons/[key]` | `staminaSystem`, dungeon config |
| Preparation | `/prepare` | `readinessSystem`, `preparationChecklistSystem` |
| Listening / encounters | `EncounterHost` | existing encounter systems |
| Vocabulary | `/vocabulary` | `brewSystem`, `vocabularyThreatSystem` |
| Word detail | `/vocabulary/[id]` | `word_mastery` |
| Inventory | `/inventory` | `inventorySystem` |
| Operator metrics | `/profile#operator-metrics` | `hunterPowerSystem` |
| XP & rewards | overlay | `rewardClaimSystem` |
| System status | `/system` | `penaltyPresentationSystem` |
| Profile | `/profile` | `HunterProfilePanel` |

## Migration

Apply `006_economy_inventory.sql` before using stamina, inventory, and brew RPCs.
