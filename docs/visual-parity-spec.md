# Visual parity spec (boards 1–3 + 16 screens)

Reference PNGs: [`assets/reference/`](assets/reference/)

| ID | Route | Parity criteria | Status |
|----|-------|-----------------|--------|
| B1-01 | `/home` | Vertical stack; objective hero dominates; corruption card weighted; no dashboard grid | Done |
| B1-02 | `/home` | Ops feed tactical density; collapsible secondary | Done |
| B1-03 | `/` | Landing fog/rain; whisper rotation; minimal chrome | Done |
| B2-01 | `/training` | Priority hero full-bleed; discipline lane backgrounds | Done |
| B2-02 | `/contracts` | Channel screen class; tab motion | Done |
| B2-03 | `/contracts/[id]` | Hero banner asset; sticky ENTER CTA | Done |
| B2-04 | Encounters | ArcadeSessionHud placement; mode emotion label | Done |
| B3-01 | `/dungeons/[key]` | Entry tension + boss silhouette | Done |
| B3-02 | Dungeon run | Boss frame asset; corruption band shell | Done |
| B3-03 | Failure overlay | Stage 3–4 glitch layer | Done |
| B3-04 | Extraction | Relic acquire card art | Done |
| B3-05 | `/map` | Hex nodes + corruption bleed + map hero | Done |
| I-07 | `/contacts` | Iris portrait + trust warnings | Done |
| I-08 | `/contracts` | Quest board atmosphere | Done |
| I-09 | `/archive` | Lore reader layout | Done |
| I-15 | `/profile` | Rank evolution + prestige panel | Done |

## Automation

`npm run check:visual` runs [`scripts/visual-audit.mjs`](../scripts/visual-audit.mjs) — captures route screenshots and validates screen-class markers.
