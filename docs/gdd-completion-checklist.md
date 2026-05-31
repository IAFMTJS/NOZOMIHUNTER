# GDD completion checklist (Vol 1–11)

Track literal GDD completion. **Out of scope:** paid Whisper/OpenAI, native mobile app.

Last updated: v3.3.0-crave-masterplan

**Legend:** **Arch** = systems/architecture done. **Content** = authored payload done (Season 1 bible).

| Vol | Requirement | Metric | Arch | Content |
|-----|-------------|--------|--------|
| 1 | Core progression loop | XP, rank, discipline, unlocks via RPC | Done | — |
| 1 | Almost-there retention | `almostThereSystem` on `/home` | Done | — |
| 2 | Training arcade | Combo decay, `ArcadeSessionHud` | Done | — |
| 2 | Contract channels | daily / side / story generation | Done | Partial |
| 2 | All mode identity | 22 modes pass `modeIdentitySystem` | Done | — |
| 3 | Dungeon V2 | route, pursuit, boss phases, extraction | Done | Partial |
| 3 | Corruption stages 1–4 | presentation + VFX | Done | — |
| 4 | Board 1–3 layout | `visual-parity-spec.md` | Done | — |
| 4 | 16 immersion screens | masterplan all Done | Done | — |
| 5 | Architecture guards | `check:architecture`, systems-only gameplay | Done | — |
| 6 | Archive lore reader | 25+ DB entries, rank gates | Done | Partial |
| 6 | NPC Iris + trust | `/contacts` portrait, corruption warnings | Done | Partial |
| 6 | Season 1 story bible | [`season-01-broken-signal-bible.md`](season-01-broken-signal-bible.md) | — | In progress |
| 6 | Crave doctrine | [`crave-doctrine.md`](crave-doctrine.md) | Done | Done |
| 7 | Global leaderboard | `leaderboard_aggregate` RPC | Done | — |
| 7 | Season progress | `season_progress` + UI chip | Done | Partial |
| 7 | Live event modifiers | XP multiplier on completion | Done | Partial |
| 7 | Prestige SSS | `apply_prestige_reset` + panel | Done | — |
| 8 | Three-filter governance | `check:gdd-governance` | Done | — |
| 8 | CI quality gate | `.github/workflows/gdd-quality.yml` | Done | — |
| 9 | Asset pipeline | manifest + storage + ingest | Done | — |
| 9 | Production art | WebP/AVIF replace SVG watermarks | Partial | Partial |
| 9 | Audio categories | stems per screen/moment | Done | — |
| 10 | 100+ contracts | `content_contracts` ingested | Done | **Not Done** — replace procedural "Main arc N" |
| 10 | 40+ archive Season 1 | beat-gated fragments | Partial | In progress |
| 10 | Boss phases all dungeons | 4–6 phases authored | Done | Partial |
| 10 | 30+ achievements DB | `content_achievements` | Done | — |
| 11 | System registry | `docs/system-registry.md` | Done | — |
| 11 | Flows + analytics doc | `flows/`, `analytics-dashboard.md` | Done | — |

## Verification commands

```bash
npm test && npm run typecheck
npm run check:gdd-governance && npm run check:theme && npm run check:architecture
npm run verify:deploy   # needs .env.local service role
npm run check:visual    # needs dev server
```
