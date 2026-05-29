# NOZOMI Game Design Document — Index

**Canonical master:** [`Complete Game Design Document.md`](./Complete%20Game%20Design%20Document.md) (v2.0, 11 volumes)

**Reference mockups:** [`assets/reference/`](./assets/reference/)

| Board | File | Routes |
|-------|------|--------|
| Command node | `board-1-command-node.png` | `/home`, `/training`, `/contracts`, `/dungeons` |
| Mode identity | `board-2-mode-identity.png` | `/training`, `/contracts`, `/dungeons` |
| Dungeon flow | `board-3-dungeon-flow.png` | `/dungeons`, dungeon overlay |

## Volume map

| Vol | Topic |
|-----|--------|
| 1 | Vision, progression, discipline, hunter power |
| 2 | Training, contracts, learning architecture |
| 3 | Dungeons, corruption, bosses, loot |
| 4 | UI/UX bible, screen specs |
| 5 | Technical PRD (see `DECISIONS.md` for stack overrides) |
| 6 | Lore, characters, bosses |
| 7 | Live service, seasons (flagged) |
| 8 | Content governance |
| 9–10 | Art + content databases |
| 11 | Cursor development bible |

## Supporting docs (implementation)

- [`core-philosophy.md`](./core-philosophy.md) · [`core-loop.md`](./core-loop.md)
- [`current-architecture.md`](./current-architecture.md) · [`system-registry.md`](./system-registry.md)
- [`reference-mockup-integration.md`](./reference-mockup-integration.md)
- [`quest-channel-ui-plan.md`](./quest-channel-ui-plan.md)
- [`ux-audit-status.md`](./ux-audit-status.md)
- [`immersion-rework-masterplan.md`](./immersion-rework-masterplan.md) — creative tone; GDD wins on conflicts

## GDD wave systems (v2.0 implementation)

| System | Path |
|--------|------|
| `almostThereSystem` | `src/systems/progression/almostThereSystem.ts` |
| `disciplineCurrencySystem` | `src/systems/progression/disciplineCurrencySystem.ts` |
| `sectorCorruptionSystem` | `src/systems/world/sectorCorruptionSystem.ts` |
| `trainingPrioritySystem` | `src/systems/training/trainingPrioritySystem.ts` |
| `bossVitalitySystem` | `src/systems/dungeons/bossVitalitySystem.ts` |
| `corruptionPresentationSystem` | `src/systems/presentation/corruptionPresentationSystem.ts` |
| `relicEffectSystem` | `src/systems/inventory/relicEffectSystem.ts` |

Migration: `supabase/migrations/018_discipline_gdd.sql`
