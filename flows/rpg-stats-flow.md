# RPG stats flow

## Data

- Columns on `progression`: `rpg_strength`, `rpg_agility`, `rpg_intelligence`, `rpg_vitality`
- Contract: `RpgStatsContract` on `PlayerContract.rpgStats`
- Migration: `010_rpg_stats.sql`

## Derivation

1. On hydrate, `resolveRpgStats` uses DB values or `deriveRpgStatsFromProgress(level, rank)`
2. `hunterPowerSystem` folds RPG stats into attack, defense, crit, and total power

## Level-up

1. `complete_quest_guarded` updates server level
2. `applyProgressionUpdate` calls `applyLevelUpDelta` when `leveledUp`
3. `savePlayer` persists RPG columns; `apply_guarded_progression` RPC accepts RPG args

## UI

- `/stats` — STR/AGI/INT/VIT bars + battle stats
- `/profile#operator-metrics` — language operator metrics (unchanged)
