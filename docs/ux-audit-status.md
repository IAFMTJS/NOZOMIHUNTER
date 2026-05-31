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

Last updated: v3.3.0-remediation.

## Expert remediation (v3.3.0)

| Priority | Theme | Status | Notes |
|----------|-------|--------|-------|
| P0 | Training one-answer claim exploit | Done | `syncTrainingObjectivesFromEncounter`, `canCompleteQuest` encounter gate |
| P0 | Word passive XP runaway | Done | Cap 35%, scope to encounter words |
| P0 | Dungeon special-room softlock | Done | Continue UI + `completeDungeonSpecialRoom` |
| P1 | Training daily milestone exploit | Done | `narrativeTier: SIDE`, guards in milestone + completion |
| P1 | Hydration infinite loading | Done | `hydrate-error` phase + retry UI |
| P1 | Double-click completion | Done | Mutex in lifecycle + hook refs |
| P2 | Game mode client trust | Done | `gameModeActionGuard` + rate limit RPC |
| P2 | Home / nav simplification | Done | 5-tab nav, home widget cuts |
| P2 | Prepare confirm modal | Done | `ConfirmDeployDialog` replaces `window.confirm` |
| P2 | Accessibility baseline | Done | Button focus-visible, nav aria-current, Escape on ceremonies |
| P2 | Reward overlay escape | Done | Claim later dismisses overlay |
| P2 | Fragment label reskin | Done | Objectives/intel copy vs universal fragments |
| P2 | Map scope honesty | Done | Show unlocked + next sealed corridor only |
| P2 | Modal focus traps | Done | `useFocusTrap` on `CeremonyOverlay` |
| P2 | Light mode polish | Done | Tactical light palette tokens tuned |
| P3 | Lost Ones side content | Done | `side-s01-031`, `lost-ones-rescue` scenario, archive transcript |
| P3 | Corruption spend route | Done | High-danger routes spend corruption for intel |
| P3 | Mode intel rewards | Done | Terminal breach + ghost interrogation set `modeIntel` |
| P3 | Boss rehearsal link | Done | Dungeon prepare links to kanji surgery drill |
| P3 | Relic run-rule wiring | Done | Extra wrong attempts + listening replays from relics |
| P3 | Daily anomaly target | Done | Single daily clear milestone |
| P3 | Migration 029 | Pending deploy | Apply `029_remediation_guards.sql` to Supabase |

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
