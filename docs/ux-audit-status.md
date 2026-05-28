# UX audit status (issues-page-by-page)

Tracks remediation against [`issues-page-by-page.md`](issues-page-by-page.md) and v1.4.1 / v1.5.0 fixes.

| Priority | Theme | Status | Notes |
|----------|-------|--------|-------|
| P0 | Recall vs recognition (masking) | Done (v1.5.1) | `encounterDisplayPolicy`, `EncounterRouterDisplayShell`, compliance tests |
| P0 | Answer leakage on encounters | Partial | `answerValidationSystem` unified; game-mode surfaces audited |
| P1 | Training deploy / play flow | Done | v1.4.1 — Play → `/prepare`, deploy opens drill |
| P1 | Dungeon resume / abandon | Done | v1.4.1 — hub banner, abort in PREPARATION |
| P1 | Guest auth gating | Done | `NEXT_PUBLIC_ENABLE_GUEST_AUTH` |
| P2 | Dashboard density on `/home` | Done (v1.5.0) | Collapsible operational feed |
| P2 | Contract board tone | Done (v1.5.1) | Channel kickers + Archive Recovery / Whisper Hunts labels |
| P2 | Dedicated failure screen | Done (v1.5.0) | `DungeonFailureCeremony` via `DungeonRunnerFailureOverlay` |

Last updated: v1.5.1 platform + immersion wave 1 slice.
