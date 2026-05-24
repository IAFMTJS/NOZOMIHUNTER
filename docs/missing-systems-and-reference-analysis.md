# NOZOMI — Missing Systems & Reference Analysis
Version: v1.0
Status: Active Expansion Document
Last Updated: 2026-05-23

---

# Purpose

This document analyzes the new visual reference direction and identifies:
- missing systems
- underdeveloped mechanics
- missing presentation layers
- immersion gaps
- UX systems not yet fully represented in the architecture

The purpose is NOT to clone the reference image.

The purpose is:
- understanding WHY the reference feels immersive
- translating emotional impact into scalable systems
- evolving NOZOMI into a cohesive hunter interface

---

# Critical Observation

The reference succeeds because:
- the system feels alive
- the interface feels reactive
- progression feels dangerous
- information feels tactical
- interactions feel system-authorized

The player is not:
> using an app

The player is:
> interfacing with a living hunter system.

This psychological distinction is critical.

---

# Missing System Category Overview

| Category | Current State | Priority |
|---|---|---|
| Hunter identity layer | Shipped (dossier, portrait layers) | — |
| Preparation systems | Shipped (readiness, checklist, deploy CTA) | — |
| Atmospheric system messaging | Shipped (`SystemMessageRail`, pools, warning tone) | — |
| Tactical information density | Partial (missions dispatch pass) | Medium |
| Dungeon anticipation systems | Shipped (`dungeonForecastSystem`, exploration beats) | — |
| Vocabulary threat analysis | Shipped (`vocabularyThreatSystem`, THREAT labels) | — |
| Reactive UI states | Shipped (deploy caution, corruption header, locked sectors) | — |
| Encounter presentation | Shipped (Transmit, listening waveform, focus shell) | — |
| Navigation immersion | Shipped (Missions nav label, transition lines) | — |
| System terminology consistency | Shipped (terminology.md + nav pass) | — |

---

# Hunter Identity Layer

## Current Problem

The profile system currently functions mostly as:
- player data
- progression display
- stat visualization

The reference image instead presents:
> a registered hunter identity.

This creates:
- emotional ownership
- system immersion
- role embodiment

---

# Missing Identity Features

## 1. Hunter Codename System

Players should receive:
- generated codenames
- hunter identifiers
- registry IDs

Examples:
- HN-042
- Echo Hunter
- Sector Runner
- Void Diver

The player should feel:
> officially registered by the system.

---

## 2. Dynamic System Quotes

The system should periodically display:
- cold observations
- rank commentary
- progression remarks
- corruption warnings

Examples:
- “The weak have no right to choose.”
- “Synchronization unstable.”
- “Threat recognition increased.”
- “Preparation incomplete.”

These messages should remain:
- restrained
- minimal
- psychologically impactful

---

## 3. Hunter Portrait Evolution

The profile layer should evolve visually:
- rank aura
- corruption effects
- unlock overlays
- faction insignia
- visual distortion states

The hunter identity should visually evolve with progression.

---

# Daily Synchronization System

## Current Problem

NOZOMI tracks progression.
But it does not yet ritualize consistency.

The reference introduces:
> discipline-based progression psychology.

---

# Missing Features

## 1. Daily Synchronization

Rename streaks internally toward:
- synchronization
- discipline chain
- hunter continuity

Avoid casual mobile-app terminology.

---

## 2. Milestone Rewards

Examples:
- supply cache unlock
- hunter archive logs
- temporary XP multipliers
- cosmetic registry effects

The player should anticipate:
- long-term discipline rewards

---

## 3. Streak Decay Tension

Missing:
- warning states
- synchronization instability
- ritual interruption tension

The player should feel:
> maintaining discipline matters.

---

# Dungeon Forecasting System

## Current Problem

Current dungeon presentation is:
- available
- locked
- completed

The reference creates:
> looming future progression pressure.

---

# Missing Features

## 1. Upcoming Dungeon Forecast

The interface should preview:
- next available dungeon
- upcoming danger tier
- estimated corruption risk
- required preparation level

Examples:
- NEXT GATE
- NEXT SECTOR
- THREAT DETECTED

---

## 2. Threat Anticipation

Future dungeons should create:
- anxiety
- preparation motivation
- curiosity
- progression hunger

The player should think:
> “I am not ready yet.”

---

# Vocabulary Threat Classification

## Current Problem

Vocabulary currently behaves too much like:
- educational content
- learning lists
- mastery tracking

The reference reframes vocabulary as:
> tactical preparation intelligence.

---

# Missing Features

## Threat-Ranked Vocabulary

Vocabulary should receive:
- threat levels
- encounter frequency ratings
- corruption relevance
- boss encounter tags

Example categories:

| Threat | Meaning |
|---|---|
| LOW | Common vocabulary |
| MEDIUM | Likely encounter vocabulary |
| HIGH | Dungeon-critical vocabulary |
| CRITICAL | Boss terminology |

---

# Psychological Result

The player no longer studies words.

The player prepares for survival.

---

# Preparation Score System

## Current Problem

Mastery exists internally.
But readiness is not clearly communicated emotionally.

The reference introduces:
> operational readiness forecasting.

---

# Missing Features

## Preparation Score

The system should calculate:
- vocabulary familiarity
- listening readiness
- corruption penalties
- fatigue state
- encounter confidence
- dungeon preparation quality

Output:
```txt
Preparation Score: 72%
Estimated Survival Efficiency: Stable
```

### Current implementation (v0.8.0)

| Piece | Location | Gap |
|-------|----------|-----|
| Vocabulary-only score | `vocabularyPreparationSystem.ts` — `100 − unknownWords × penalty` | Does not factor listening, fatigue, corruption, or dungeon context |
| UI meter | `PreparationScoreBar`, `QuestPreparationBriefing` | Label is generic (“Mission readiness”); no survival-efficiency band |
| Quest attachment | `QuestVocabularyPreparationContract.preparationScore` | Score is briefing-only, not player-global readiness |

### Target system: `readinessSystem`

**Location (proposed):** `/src/systems/readiness/readinessSystem.ts`

**Inputs:**
- `masterySystem` — mean mastery on quest/dungeon target words
- `player.stats.listening` + listening unlock state
- `player.penalties` — corruption, fatigue, xpDebt
- `quest.type` / `dungeonKey` — weights per encounter mix
- Optional: recent quest failure rate from `analyticsSystem` buffer

**Outputs:**
- `preparationScore: number` (0–100)
- `survivalBand: "CRITICAL" | "UNSTABLE" | "STABLE" | "OPTIMAL"`
- `factors: ReadinessFactorContract[]` — for tactical UI (one line each)

**Consumers:** `ContractHub` menu, `QuestPreparationGate`, `DungeonCorridorCard` (forecast), profile panel.

Do **not** duplicate score math in components — extend `vocabularyPreparationOrchestrator` to call `readinessSystem` for quest briefings.

---

# Atmospheric System Messaging

## Current Problem

System voice exists in isolated places (`HomeTerminal` boot lines, extraction “Sync registry”, briefing copy) but the **dashboard does not feel observed**.

The reference treats the UI as a **terminal that comments on the player**, not a static form.

## Current implementation

| Surface | System voice | Strength |
|---------|--------------|----------|
| `/` boot | `HomeTerminal` `BOOT_LINES` | Strong, one-shot |
| Dashboard menu | Username + rank + corruption number | Factual, not atmospheric |
| Profile | “Hunter registry” header | Label only |
| Penalties | `PenaltyStatus`, corruption audio | Reactive to stats, not narrative |
| Quest prep | “Registry match complete…” | Good tone, quest-scoped |

## Missing: `systemMessagingSystem`

**Responsibilities:**
- Select context-appropriate lines (rank, corruption tier, preparation score, sync state, dungeon lock)
- Cooldown / rotation so messages do not spam
- Emit `SYSTEM_MESSAGE_SHOWN` for analytics (optional)

**Config:** `/src/config/systemMessages.ts` — categorized pools:
- `OBSERVATION` — cold rank commentary
- `WARNING` — corruption, low readiness, sync decay
- `ANTICIPATION` — next dungeon, locked gate
- `ACKNOWLEDGMENT` — level/rank (restrained; never celebrate like a mobile game)

**UI:** `SystemMessageRail` — single line under hunter identity on menu view only (`hubView === "menu"`), monospace, muted → accent on warnings.

**Rules (from gameplay philosophy):**
- Max one active system line on dashboard menu
- No modal popups for flavor text
- Japanese learner content still follows romaji rules elsewhere; system lines are English

---

# Tactical Information Density

## Current Problem

The command node menu shows **identity + three operations**. The reference packs **actionable intel**: next threat, readiness, sync state, penalty subtext, upcoming gate.

Players see *what they can click*, not *what the system knows about them*.

## Missing presentation layer

| Intel type | Source system | Suggested UI slot |
|------------|---------------|-------------------|
| Global readiness | `readinessSystem` | Menu: compact bar + band label |
| Next dungeon gate | `dungeonForecastSystem` | Menu: “Next gate” inset block |
| Active corruption/fatigue narrative | `penaltySystem` + messages | Extend `PenaltyStatus` or system line |
| Contract urgency | `questSystem` — prep incomplete, encounter type | Hunt card badge already partial |
| Vocabulary threat summary | `vocabularyThreatSystem` | Prep briefing + profile “Threat index” |

**Layout rule (visual-direction-v2):** Add intel as **vertical inset blocks** below identity, not a second dashboard grid.

---

# Reactive UI States

## Current implementation

| State | Mechanism | Coverage |
|-------|-----------|----------|
| Corruption atmosphere | `penaltyPresentationSystem` → shell/encounter classes | Good |
| Fatigue | Slower transitions | Partial |
| Contract ready | `.nozomi-contract-ready` | Quest cards |
| Answer flash | `.nozomi-flash-success` / `-danger` | Encounters |
| Hub view isolation | Overlays gated to `hubView === "menu"` | Good |

## Gaps

- **No identity-reactive chrome** — rank/corruption do not change portrait, aura, or header tint
- **No readiness-reactive hunt CTA** — low preparation should visually stress “deployment risky”
- **Dungeon cards** — locked vs available differ; no “approaching eligibility” (e.g. level 3 of 4)
- **Menu cards** — disabled state is opacity only; missing system-authorized copy (“Access denied — synchronization required”)

**Proposed:** `hunterPresentationSystem` (parallel to `penaltyPresentationSystem`) maps `PlayerContract` + readiness → CSS modifier classes on `HunterShell` / profile portrait slot.

---

# Encounter Presentation

## Current Problem

Encounters are functionally complete but still read as **exercise UI** in places (generic labels, educational importance chips).

## Reference translation

| Reference feel | NOZOMI direction |
|----------------|----------------|
| Target under surveillance | `EncounterTargetRail` + sector label from dungeon/quest |
| Pressure | Listening replay budget, wrong-attempt counter (already penalty-modulated) |
| Authorization | “Deploy” / “Transmit” verbs instead of “Submit” where thematic |

## Gaps

- Vocabulary importance shown as `HIGH` / `MEDIUM` / `LOW` — reads academic; map to **THREAT** lexicon in UI only (`CRITICAL`, `ELEVATED`, `ROUTINE`)
- No boss-term tagging on vocabulary explanations
- Conversation/speech lack “channel” framing (operator ↔ sector)

**Keep:** All answer validation in `*EncounterSystem` files — UI only changes labels and presentation contracts.

---

# Navigation Immersion

## Current Problem

Navigation is standard App Router: links, back labels (“← Hunter status”), hub views inside one page.

The reference implies **sector traversal** — moving through space, not tabs.

## Current strengths

- `ContractHub` hub views (`menu` | `hunt` | `contracts` | `sector`) with motion transitions
- `DungeonPhaseStepper` + `DungeonCorridorRail` inside runs
- Page titles follow hub view in `DashboardClient`

## Missing

- **Sector map metaphor** — list of corridors without “distance” or “next breach point”
- **Transition copy** — entering hunt/sector could flash one system line (like boot sequence, 1 line)
- **Profile as registry file** — `/profile` is a stats page, not a dossier

**Low-risk wins:** Animated `HubBack` with system line; breadcrumb replaced by operation codename (`OP: HUNT-ACTIVE`).

---

# System Terminology Consistency

## Canonical terms (target)

| Avoid | Use |
|-------|-----|
| Streak | Synchronization / discipline chain |
| Lesson / study | Contract / deployment / briefing |
| Quiz | Encounter |
| User / account | Hunter / registry |
| Dashboard (player-facing) | Hunter status / command node |
| XP bar (flavor) | Extraction progress / hunter growth (HUD can stay XPBar internally) |
| Locked | Corridor sealed / access denied |
| New word list | Threat index / mission targets |

## Current drift (audit)

| Location | Issue |
|----------|-------|
| `ContractHub` | “request new work from the grid” — grid language |
| `DungeonCorridorCard` | “Enter {name}” — acceptable; “Corridor sealed” is good |
| `PreparationScoreBar` default label | “Mission readiness” — OK; prefer “Operational readiness” |
| `HunterProfilePanel` | “Combat stats” — slightly generic; “Operator metrics” optional |
| Stats `consistency` | DB field exists; not surfaced as synchronization discipline |

**Action:** Glossary in `/docs/terminology.md` (new) + lint copy in PRs against `rules/gameplay-rules.md`.

---

# Codebase Gap Summary

Status as of **v0.9.0** (2026-05-23). “Partial” = shipped but room to deepen.

| System / feature | Status | Notes |
|------------------|--------|-------|
| Hunter codename / registry ID | **Shipped** | `hunterIdentitySystem`, migration 005, `HunterIdentityBlock` |
| Dynamic system quotes | **Shipped** | `systemMessagingSystem` + `SystemMessageRail` |
| Hunter portrait evolution | **Partial** | Procedural SVG layers + rank/corruption/sync; no custom art pipeline |
| Daily synchronization | **Shipped** | `synchronizationSystem`, profile + menu display |
| Discipline milestones | **Shipped** | `title:discipline-3/7/14` on chain length |
| Sync decay tension | **Shipped** | AT_RISK / BROKEN states + warning copy |
| Dungeon forecast | **Shipped** | `dungeonForecastSystem` + `NextGateForecast` |
| Threat anticipation copy | **Shipped** | Forecast sublines + system anticipation pool |
| Vocabulary threat tiers | **Shipped** | `vocabularyThreatSystem` + `vocabularyThreatMetadata` + briefing UI |
| Holistic preparation score | **Shipped** | `readinessSystem` + quest prep merge |
| System message rail | **Shipped** | Menu + profile |
| Tactical menu intel | **Shipped** | Identity, readiness, sync, forecast, operations |
| Reactive hunter chrome | **Partial** | `hunterPresentationSystem`; no bitmap portraits |
| Encounter tactical framing | **Partial** | Transmit labels on vocab/listen/dialogue |
| Navigation immersion | **Partial** | `SectorMapRail` breach map + operation codes |
| Terminology consistency | **Partial** | [`docs/terminology.md`](terminology.md) + copy pass |
| Visual direction v2 | **Partial** | Spec + tokens; ongoing screen passes |

---

# Proposed Systems (registry additions)

Add to `docs/system-registry.md` when implemented:

### `hunterIdentitySystem`
- Generate/store `codename`, `registryId` (deterministic from user id + salt in DB)
- Migration: `profiles.hunter_codename`, `profiles.registry_id`

### `systemMessagingSystem`
- Contextual line selection; no React

### `synchronizationSystem`
- Track `last_active_date`, discipline chain, decay warnings
- Events: `SYNC_MAINTAINED`, `SYNC_DECAY_WARNING`, `SYNC_BROKEN`
- Milestones via `progressionSystem` unlock keys (`title:discipline-*`)

### `dungeonForecastSystem`
- `getNextDungeonForecast(player, activeQuests)` → next locked/available gate, danger tier, recommended readiness
- Uses `dungeonAccess` + `dungeonConfig` + `readinessSystem`

### `vocabularyThreatSystem`
- Map catalog entry + quest/dungeon context → `ThreatLevel`
- Extends `vocabularyExplanationSystem`; UI maps threat → display label

### `readinessSystem`
- Global and per-mission preparation score + survival band

### `hunterPresentationSystem`
- CSS class mapping for rank aura, corruption distortion, portrait overlays

---

# Implementation Phases

Aligned with architecture rules: systems pure, services for DB, contracts updated, UI presentation-only.

## Phase A — High impact, low schema risk (UI + systems, no migration)

1. `systemMessagingSystem` + `SystemMessageRail` on menu view
2. Terminology pass on `ContractHub`, preparation, dungeon copy
3. Threat labels in `QuestPreparationBriefing` (map `importance` → threat display)
4. `dungeonForecastSystem` (read-only) + “Next gate” block on menu
5. `readinessSystem` v1 — combine vocab prep score + penalties + listening stat

## Phase B — Identity & discipline (requires migration)

1. DB columns + `hunterIdentitySystem` + profile/dashboard codename display
2. `synchronizationSystem` + discipline milestones in `unlockRegistry`
3. `hunterPresentationSystem` + portrait placeholder with rank/corruption modifiers

## Phase C — Depth

1. `vocabularyThreatSystem` — boss tags, dungeon-critical flags in curated catalog metadata
2. Encounter verb / channel presentation pass
3. Navigation transition lines; profile dossier layout

---

# Non-Goals

Do **not** implement from the reference:

- Cloning layout pixel-for-pixel
- Gacha / casino reward loops
- Social feed or leaderboard spam
- Extra columns on dashboard that break single mental state per screen
- Gameplay logic inside UI components
- Browser writes to `vocabulary_entries`

---

# Success Criteria

The reference analysis is satisfied when a returning player feels:

1. **Registered** — codename + registry ID visible on hunter status
2. **Observed** — rotating system line reacts to corruption and readiness
3. **Accountable** — synchronization discipline has tension and recovery
4. **Unready** — next dungeon gate shows danger before entry is allowed
5. **Tactical** — vocabulary briefing reads as threat intel, not homework
6. **Deployed** — preparation score reflects penalties and encounter type, not word count alone

---

# Related Documents

| Document | Role |
|----------|------|
| [`visual-direction-v2.md`](visual-direction-v2.md) | Visual target for UI work |
| [`nozomi-product-spec.md`](nozomi-product-spec.md) | Shipped feature inventory |
| [`current-architecture.md`](current-architecture.md) | Implementation status |
| [`system-registry.md`](system-registry.md) | System index — update when adding systems |
| [`vocabulary-philosophy.md`](vocabulary-philosophy.md) | Mastery vs preparation |
| [`failure-design.md`](failure-design.md) | Penalty tone |
| [`prompts/master-session-prompt.md`](../prompts/master-session-prompt.md) | Agent constraints |

---

*This analysis reflects gap-closure through v1.2.2 (phases A–C + reference gap closure).*