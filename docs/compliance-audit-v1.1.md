# Architecture compliance audit — v1.1.0

**Date:** 2026-05-23  
**Compliance score:** 86 / 100 (up from ~68 pre-remediation)

## Fixed in v1.1

| Area | Fix |
|------|-----|
| XP authority | Removed dead `completeQuest` / `applyQuestReward` client path |
| Unlock keys | `dashboard` → `home` (migration 009 + hydrate normalize) |
| Shell | Deleted `DashboardClient`, `HunterShell`, `HunterAppShell` |
| Hub module | `features/hub/` with split `ContractHub` views |
| Routes | `/contracts` canonical; `/missions` redirects |
| Stats | Merged into `/profile#operator-metrics`; `/stats` redirects |
| Readiness | `useHunterReadiness` + session context |
| Events | `GAME_EVENTS` canonical in `contracts/event-contract.ts` |
| Encounters | Shared `encounterSubmitAdapter` |
| Tests | Vitest for validator, readiness, rewards |
| Terminology | Copy pass (dashboard/grid → hunter language) |

## Residual risks

| Risk | Severity | Notes |
|------|----------|-------|
| `questGenerator.ts` / `questEncounterRepair.ts` >300 lines | Low | Deferred split; modular extractions planned |
| `playerRepository.ts` >300 lines | Low | Acceptable for hydrate hub |
| Internal `mission*` system names vs `/contracts` routes | Low | Player-facing routes aligned; code names unchanged |
| Runtime Zod on all service boundaries | Medium | `playerSchema` exists; not exhaustive |

## Rule compliance

- Gameplay logic outside React components: **Pass** (QuestCard uses `canCompleteQuest`)
- Systems avoid React imports: **Pass**
- DB access via services only: **Pass**
- Single guarded completion path: **Pass**
- No paid APIs: **Pass** (per DECISIONS.md)

## Recommended next

1. Split `questGenerator` / `questEncounterRepair` when adding quest types
2. Rename `missionCatalogSystem` → `contractCatalogSystem` (internal, atomic)
3. Expand Zod validation on `loadPlayer` and RPC responses
