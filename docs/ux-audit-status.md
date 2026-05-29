# UX audit status (issues-page-by-page)

Tracks remediation against [`issues-page-by-page.md`](issues-page-by-page.md) and v1.4.1 / v1.5.0 fixes.

| Priority | Theme | Status | Notes |
|----------|-------|--------|-------|
| P0 | Recall vs recognition (masking) | Done (v1.5.1) | `encounterDisplayPolicy`, `EncounterRouterDisplayShell`, compliance tests |
| P0 | Answer leakage on encounters | Done (v2.1) | `challengeDisplaySystem` on training modes; contract progress rails |
| P1 | Training deploy / play flow | Done | v1.4.1 — Play → `/prepare`, deploy opens drill |
| P1 | Dungeon resume / abandon | Done | v1.4.1 — hub banner, abort in PREPARATION |
| P1 | Guest auth gating | Done | `NEXT_PUBLIC_ENABLE_GUEST_AUTH` |
| P2 | Dashboard density on `/home` | Done (v1.5.0) | Collapsible operational feed |
| P2 | Contract board tone | Done (v1.5.1) | Channel kickers + Archive Recovery / Whisper Hunts labels |
| P2 | Dedicated failure screen | Done (v1.5.0) | `DungeonFailureCeremony` via `DungeonRunnerFailureOverlay` |

Last updated: v3.2.0-gdd-final.

## Immersion 16-screen masterplan

All screens **Done** — see [`immersion-rework-masterplan.md`](immersion-rework-masterplan.md).

## Visual parity (boards 1–3)

| Board | Status | Notes |
|-------|--------|-------|
| 1 Command node | Done (v3) | Hero art, corruption stages, landing weather |
| 2 Mode identity | Done (v3) | Training lanes, arcade HUD, contract hero |
| 3 Dungeon flow | Done (v3) | Boss frame, entry art, failure VFX, map nodes |

## GDD + mockup wave checklist

| Board | Item | Status |
|-------|------|--------|
| 1 | Active objective hero on `/home` | Done |
| 1 | Sector corruption card | Done |
| 1 | Hunter power percentile | Done |
| 1 | Proximity chips | Done |
| 1 | Iris NPC message | Done |
| 2 | Training today's priority | Done |
| 2 | Training results ceremony | Done |
| 2 | Contract detail risk + Claim | Done |
| 2 | Boss HP HUD | Done |
| 3 | Corruption threshold FX | Done |
| 3 | Run summary S-grade | Done |
| Meta | Discipline currency | Done |
| Meta | Relic equip rail | Done |
