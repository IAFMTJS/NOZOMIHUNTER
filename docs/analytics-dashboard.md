# Analytics dashboard — gameplay_events mapping

Product metrics derived from `public.gameplay_events` (see migration `018_gameplay_events.sql`).

| Event type | Product metric |
|------------|----------------|
| `QUEST_COMPLETED` | Contract completion rate, channel mix |
| `DUNGEON_COMPLETED` | Sector extraction success |
| `SECTOR_CLEARED` | In-run engagement depth |
| `ENCOUNTER_COMPLETED` | Training / encounter throughput |
| `LEVEL_UP` | Progression velocity |
| `RANK_UP` | Rank funnel |
| `ACHIEVEMENT_UNLOCKED` | Achievement coverage |
| `DAILY_MILESTONE_REACHED` | Daily retention (3rd clear) |
| `PRESTIGE_RESET` | Endgame loop adoption |

## Leaderboards

- **Weekly:** `leaderboard_aggregate(p_limit)` — last 7 days.
- **Lifetime:** `leaderboard_aggregate_lifetime(p_limit)` — all-time.

## Season

- `season_progress` + RPC `add_season_points` — season pass tier progression.

## Suggested charts

1. DAU with at least one `QUEST_COMPLETED` or `DUNGEON_COMPLETED`.
2. Weekly leaderboard top 10 (`leaderboard_aggregate`).
3. Daily milestone conversion (`DAILY_MILESTONE_REACHED` / active users).
4. Prestige rate (`PRESTIGE_RESET` / SSS operators).
