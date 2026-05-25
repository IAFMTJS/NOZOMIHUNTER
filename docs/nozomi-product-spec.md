# NOZOMI — Product, UI & Technical Specification

**Version:** v0.8.0 (main)  
**Last updated:** 2026-05-23  
**Purpose:** Single reference for visuals, features, site setup, and tech stack. Aligns with [`prompts/master-session-prompt.md`](../prompts/master-session-prompt.md).

---

## 1. Product identity

### What NOZOMI is

- **NOZOMI: Hunter System** — an immersive Japanese-learning RPG
- Mastery-driven progression (not flashcards, not a generic “learning app”)
- Inspirations: oldschool MMO loops, Solo Leveling–style growth, Persona atmosphere, Monster Hunter preparation

### What players do

Login → receive contracts (quests) or enter dungeon sectors → Japanese encounters (vocab, dialogue, speech, listening) → XP & unlocks → rank/level growth → repeat.

### Core loop

```text
Login → Quest or Dungeon → Encounter → XP → Level / Rank → Unlock systems → Save (Supabase)
```

---

## 2. Visual & UI design

### Design philosophy

From [`rules/ui-rules.md`](../rules/ui-rules.md) and [`prompts/ui-prompts.md`](../prompts/ui-prompts.md):

| Must feel | Must not feel |
|-----------|----------------|
| Immersive, atmospheric, game-first | Productivity / corporate dashboard |
| Minimal, layered, mysterious | Casino dopamine, clutter, reward spam |
| Readable, responsive | Oversized chrome, stacked modals |

**Priority order:** readability → responsiveness → immersion → effects → decoration.

**Rule:** Every UI element must serve a gameplay purpose; otherwise remove it.

### Typography

| Role | Family | Source |
|------|--------|--------|
| Display / headings | Barlow Condensed (500–700) | `@fontsource/barlow-condensed` |
| Body / UI | DM Sans (400–600) | `@fontsource/dm-sans` |
| Japanese | Noto Sans JP (400–700) | `@fontsource/noto-sans-jp` |

Fonts are **bundled at build time** via [`src/app/fonts.css`](../src/app/fonts.css) (no `next/font/google` fetch). CSS variables: `--font-display-family`, `--font-body-family`, `--font-japanese-family`.

Utility classes: `.font-display`, `.font-japanese`.

### Visual direction v2

Active spec: [`docs/visual-direction-v2.md`](visual-direction-v2.md) — atmospheric hunter terminal (purple tactical glow, vertical layout, embedded panels). v1 moonlight/blue dashboard aesthetic is retired.

### Color & surface tokens

Defined in [`src/app/globals.css`](../src/app/globals.css):

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#05070b` | Page base |
| `--foreground` | `#f3f5ff` | Primary text |
| `--accent` / `--accent-bright` | `#7a5cff` / `#9b7dff` | System glow, CTAs, environmental light |
| `--accent-dim` | rgba accent ~10% | Panel highlights |
| `--reward` | `#ffb84d` | Level/rank/extraction rewards only |
| `--danger` | `#ff4d6d` | Failures, boss tone |
| `--warning` | `#ffb84d` | Degraded signal, hints |
| `--success` | `#58d68d` | Positive feedback |
| `--corruption` | `#a855f7` | Penalty atmosphere |
| `--muted` | `#78809a` | Secondary copy |
| `--surface-header` | translucent `#0b1020` | Sticky header fade |
| `--surface-1` / `--surface-2` | translucent layers | Panels, inset |
| `--border-subtle` / `--border-accent` | white 6% / purple | Focus, rare borders |
| `--glow-accent` | soft purple glow | Atmosphere, ready contracts |

### Atmosphere & motion

| Class / system | Effect |
|----------------|--------|
| `.nozomi-atmosphere` | Entry — purple radial gradients |
| `.nozomi-atmosphere-lobby` | Command node lobby |
| `.nozomi-embedded` / `-accent` | Borderless embedded panels |
| `.nozomi-scanlines` / `-light` | Subtle CRT scanlines |
| `.nozomi-vignette` / `-light` | Edge darkening |
| `.nozomi-encounter-focus` | Fullscreen hunt backdrop |
| `.nozomi-contract-ready` | Accent ring on actionable contracts |
| `.nozomi-corruption-low` / `-high` | Scanline tint, hue shift, glitch on panels |
| `.nozomi-fatigue` | Slower transitions |
| `.nozomi-flash-success` / `-danger` | Answer feedback pulses |
| `motionPresets` | Framer Motion timings (`MOTION.panel`, etc.) |

### Penalty presentation

- **HUD:** `PenaltyStatus`, XP debt on `XPBar`
- **Shell:** `penaltyPresentationSystem` adds classes to `HunterShell` / encounters
- **Audio:** corruption hum via `audioSystem` when corruption ≥ 50
- **Gameplay:** `penaltyGameplaySystem` tightens wrong-attempt budget, listening replays, dungeon failure tolerance

### Audio UI

- Web Audio procedural cues: confirm, error, level-up, sector clear, quest complete, corruption
- Optional themed MP3s per dungeon theme (`public/audio/`, `themedAudioSystem`)
- `AudioMuteToggle` in header; user gesture unlocks audio (`unlockAudio`)

### Mobile / safe area

- `viewportFit: cover`, `pt-safe` / `pb-safe` on shell and focus shell
- `EncounterFocusShell`: `env(safe-area-inset-*)` padding in fullscreen hunt mode
- Touch targets ≥ 44px on encounter actions (mobile pass)
- Mic: `getUserMedia` on tap; LAN HTTPS via `npm run dev:mobile`

---

## 3. UI component inventory

**Reuse from** `/src/components/ui` and `/src/components/layout` — **no gameplay logic in components.**

### Layout

| Component | Role |
|-----------|------|
| `HunterShell` | App chrome: header, HUD slot, atmosphere wrapper, profile link |
| `AtmosphericBackground` | Lobby / entry variants |
| `HomeTerminal` | Landing boot sequence (“Initialize hunter”) |

### Core UI kit

| Component | Role |
|-----------|------|
| `Button` | Primary / ghost / sizes |
| `Panel` | `default`, `accent`, `inset`, `boss` tones |
| `Input` | Labeled form fields |
| `StatusChip` | Quest type, dungeon state, locks |
| `EncounterFocusShell` | Fullscreen hunt mode + footer |
| `EncounterTargetRail` | Sector / word progress rail |
| `EncounterFeedback` | Inline encounter result copy |
| `DungeonPhaseStepper` | Dungeon state machine phases |
| `DungeonCorridorRail` | Sector progress in dungeon |
| `DungeonCorridorCard` | Enter / locked corridor with reason |
| `AudioMuteToggle` | Mute procedural + themed audio |

### Preparation

| Component | Role |
|-----------|------|
| `QuestPreparationGate` | Blocks encounter until briefing dismissed |
| `QuestPreparationBriefing` | Unknown-word hunter briefing |
| `PreparationScoreBar` | Readiness meter |

### Progression notices

| Component | Role |
|-----------|------|
| `LevelUpCeremony` | Fullscreen level advancement (slam overlay, stat gains, unlocks) |
| `AchievementUnlockCeremony` | Fullscreen achievement unlock |
| `RankUpNotice` | Rank promotion panel |
| `UnlockNotice` | Registry unlock (from `unlockRegistry`) |
| `InstallPrompt` | PWA install (Android / iOS copy) |

### Feature screens (composed)

| Area | Key components |
|------|----------------|
| Contract board | `ContractHub` → menu / hunt / dispatch / sector |
| Quests | `QuestCard`, `VocabularyEncounter`, `ConversationEncounter`, `SpeechEncounter`, `ListeningEncounter` |
| Dungeons | `DungeonRunner`, `DungeonClearCeremonyFlow`, `BossCollapsePhase` |
| Training | `TrainingClient`, `ArcadeCard`, mode encounter shells |
| Feedback | `EncounterImpactLayer`, `ComboMeter` (vocab, listening, survival) |
| Profile | `HunterProfilePanel` |
| Auth | `LoginForm` |

---

## 4. Site map & routes

| Route | Purpose |
|-------|---------|
| `/` | Landing — `HomeTerminal` boot, link to login / home |
| `/login` | Supabase auth (email, magic link, Google, guest) |
| `/auth/callback` | OAuth / magic-link callback |
| `/home` | **Hunter status** — identity, sync, corruption, forecast |
| `/contracts`, `/contracts/[id]` | Contract board + detail / track |
| `/dungeons`, `/dungeons/[key]` | Sector list + enter (stamina) |
| `/prepare` | Preparation ring, checklist, power compare |
| `/vocabulary`, `/vocabulary/[id]` | Threat index + word detail + brew |
| `/inventory` | Loadout grid + capacity |
| `/stats` | RPG core stats (STR/AGI/INT/VIT) + battle stats |
| `/settings` | Audio, reduced motion, logout |
| `/records` | Hunter registry log (`gameplay_events` + completed contracts) |
| `/profile#operator-metrics` | Language operator metrics |
| `/system` | Integrity + penalties |
| `/profile` | Hunter dossier menu |
| `/dashboard` | Redirect → `/home` |
| `/icon` | Dynamic app icon (望 mark) |
| `/manifest.webmanifest` | PWA manifest |

**PWA:** `display: standalone`, `start_url: /home`, theme `#05070b`. Service worker in production only (`public/sw.js`).

---

## 5. Features (gameplay)

### Contract board (`ContractHub`)

Progressive disclosure:

1. **Command node menu** — Active hunt / Contract dispatch / Dungeon sector  
2. **Hunt** — Active non-dungeon contract in `QuestCard` + focus shell  
3. **Dispatch** — Request new quest, list active contracts  
4. **Sector** — All dungeons via `DungeonCorridorCard` (available vs locked)

### Quest types

| Type | Encounter | Notes |
|------|-----------|--------|
| `VOCABULARY` | Word rail, typed answers | Prep gate if unknown words |
| `CONVERSATION` | Rule-based NPC dialogue | No paid LLM |
| `SPEECH` | MediaRecorder + browser STT | Typed fallback; mobile mic on gesture |
| `LISTENING` | TTS playback, no meaning on screen | Replay cap scales with corruption |
| `DUNGEON` | Full run via `DungeonRunner` | Separate from “regular” quest list |

Dispatch weights (approx.): speech L3+, listening L2+ with `system:listening`, else conversation / vocabulary.

### Dungeons

| Key | Name | Min level | Prerequisite |
|-----|------|-----------|--------------|
| `dungeon:neon-corridor` | Neon Corridor | 2 | Starter-unlocked in `defaultProgression` |
| `dungeon:shadow-archive` | Shadow Archive | 4 | Extract from Neon Corridor |

**Phases:** PREPARATION → EXPLORATION → ENCOUNTER (vocab / listen / NPC / speech) → REWARD → BOSS → EXTRACTION (`DungeonClearCeremonyFlow`) → complete.

### Progression & unlocks

- XP / level / rank (E→S thresholds in `progressionConfig`)
- Quest rewards merge unlocks via `resolveQuestCompletion` → persisted + `UNLOCK_GRANTED`
- UI queue: `UnlockNotice`, `RankUpNotice`, `LevelUpCeremony`, `AchievementUnlockCeremony`, tiered `RewardClaimOverlay`
- Registry labels: `unlockRegistry` (`system:*`, `dungeon:*`, `title:*`)

### Penalties (failure design)

| Stat | UI | Gameplay |
|------|-----|----------|
| Corruption | Scanlines, glitch, hum | Fewer wrong attempts, fewer listening replays, stricter dungeon fail budget |
| Fatigue | Slower motion | Reduced XP multiplier; −1 on quest/dungeon complete |
| XP debt | Shown on XP bar | Reduces effective XP gain until repaid |

### Vocabulary data

Per master session prompt:

- **Supabase anon client:** auth, reads, per-user `word_mastery`, etc.
- **`vocabulary_entries` writes:** service-role ingest only (`npm run ingest:jmdict`) — never browser upsert
- **Curated catalog:** in-memory `JMDICT_CURATED`; DB extends when ingested

### Not yet / flagged off

- Multiplayer (Phase 6 scaffold, feature flags off)
- Paid AI APIs (explicitly none)

---

## 6. Site setup & operations

### Prerequisites

- Node.js (LTS recommended)
- npm
- Supabase project (free tier OK)

### Environment

Copy [`.env.example`](../.env.example) → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional:

- `NEXT_PUBLIC_SPEECH_DEBUG=true` — browser console speech logs  
- `SUPABASE_SERVICE_ROLE_KEY` — **ingest script only** (never expose to client)

Restart `npm run dev` after changing env.

### Database migrations (in order)

1. `001_foundation.sql`  
2. `002_jmdict_vocabulary.sql`  
3. `003_progression_guards.sql` — `apply_guarded_progression`, speech rate limits  
4. `004_quest_completion_and_analytics.sql` — `complete_quest_guarded`, `gameplay_events`

```bash
npm install
npx supabase login
npx supabase link --project-ref <ref>
npm run db:push
```

### Auth redirect URLs

- Local: `http://localhost:3000/auth/callback`  
- Production: `https://<your-domain>/auth/callback`

Enable in Supabase: Email, Google, Anonymous (guest).

### npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run dev:mobile` | HTTPS on `0.0.0.0` for phone mic / LAN |
| `npm run build` / `start` | Production build & serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next) |
| `npm run db:push` | Apply Supabase migrations |
| `npm run db:reset` | Local Supabase reset |
| `npm run ingest:jmdict` | Bulk vocabulary ingest (service role) |

### PWA & offline

See [`docs/mobile-pwa.md`](mobile-pwa.md). Offline = cached shell + static assets only; **gameplay requires network** for auth and saves.

---

## 7. Technical specification

### Stack

| Layer | Technology | Version (approx.) |
|-------|------------|-------------------|
| Framework | Next.js App Router | 15.x |
| UI | React | 19.x |
| Language | TypeScript (strict) | 5.8 |
| Styling | Tailwind CSS | 4.x |
| Motion | Framer Motion | 12.x |
| State | Zustand | 5.x |
| Backend | Supabase (Auth + Postgres) | — |
| Validation | Zod | 3.x |

**Paid APIs:** none (no OpenAI, Anthropic, Whisper cloud).

### Architecture rules

| Rule | Location |
|------|----------|
| Gameplay logic | `/src/systems` only |
| DB access | `/src/services/supabase` |
| Data shapes | `/contracts` (no React, no logic) |
| Features | `/src/features/*` — UI + hooks + thin services |
| Events | `eventBus` + `GAME_EVENTS` |
| UI | `/src/components` — presentation only |

### Key systems (reference)

| System | Responsibility |
|--------|----------------|
| `questGenerator` / `questOrchestrator` | Contract creation & state |
| `questLifecycle` / `dungeonLifecycle` | Complete, fail, persist |
| `resolveQuestCompletion` | Merge unlocks, emit `UNLOCK_GRANTED` |
| `progressionOrchestrator` | XP, rank, fatigue multiplier |
| `penaltySystem` / `penaltyGameplaySystem` | Apply & modulate penalties |
| `dungeonOrchestrator` | Sector / boss / extraction state machine |
| `japaneseTtsSystem` | Browser speech synthesis for listening |
| `speechMediaRecorder` + STT | Speech encounters |
| `audioSystem` / `themedAudioSystem` | Feedback audio |
| `analyticsSystem` | `gameplay_events` buffer |

### Supabase RPCs (guarded progression)

- `complete_quest_guarded` — validated quest completion + XP grant  
- `apply_guarded_progression` — autosave; XP changes rejected except via completion RPC  
- `record_gameplay_event` — analytics  

### Repository layout

```text
/contracts          — TypeScript contracts
/rules              — Architecture, gameplay, UI rules
/flows              — Flow diagrams (quest, dungeon, speech, …)
/prompts            — Cursor prompts (master-session, ui, dungeon, …)
/docs               — Live docs (this file, architecture, PWA, …)
/supabase/migrations
/src/app            — Routes, globals, fonts, manifest
/src/features       — auth, dashboard, quests, dungeons, speech, conversation, profile
/src/systems        — Gameplay engines
/src/services       — Supabase, speech, jmdict, vocabulary bootstrap
/src/components     — Shared UI
/src/stores         — usePlayerStore (Zustand)
/src/config         — dungeon, penalty, listening, unlock registry, features
/public             — sw.js, icons, optional audio
```

---

## 8. Development workflow (from master session prompt)

### Before generating code

1. Read architecture, naming, gameplay rules  
2. Read contracts, current architecture, system registry  
3. Analyze existing systems; avoid duplicate logic  

### Before UI work

1. Read `rules/ui-rules.md`, `prompts/ui-prompts.md`  
2. Reuse `/src/components/ui` and `/src/components/layout`  
3. Never place gameplay logic inside UI components  

### After implementation

1. Update documentation  
2. Update contracts  
3. Update flows  
4. Update `CHANGELOG.md`  

### Quality bar

- Strict TypeScript  
- Feature-based, modular systems  
- Avoid oversized files  
- Preserve gameplay philosophy and architecture consistency  

---

## 9. Related documents

| Document | Topic |
|----------|--------|
| [`README.md`](../README.md) | Project overview |
| [`DECISIONS.md`](../DECISIONS.md) | Stack decisions |
| [`docs/current-architecture.md`](current-architecture.md) | Implementation status |
| [`docs/missing-systems-and-reference-analysis.md`](missing-systems-and-reference-analysis.md) | Reference gap analysis & phased roadmap |
| [`docs/system-registry.md`](system-registry.md) | System index |
| [`docs/visual-direction-v2.md`](visual-direction-v2.md) | Visual direction v2 (hunter terminal) |
| [`docs/failure-design.md`](failure-design.md) | Penalty philosophy |
| [`docs/supabase-setup.md`](supabase-setup.md) | Backend setup |
| [`docs/mobile-pwa.md`](mobile-pwa.md) | PWA & mobile QA |
| [`CHANGELOG.md`](../CHANGELOG.md) | Version history |
| [`prompts/master-session-prompt.md`](../prompts/master-session-prompt.md) | Agent session rules |
| [`docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md`](GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md) | Gameplay evolution & mode differentiation north star |
| [`docs/core-loop.md`](core-loop.md) | Mode-aware core loop |
| [`contracts/game-mode-contract.ts`](../contracts/game-mode-contract.ts) | `GameModeId` + emotion types |
| [`src/config/gameModeRegistry.ts`](../src/config/gameModeRegistry.ts) | Mode registry config |

---

*This spec reflects the codebase at v0.8.0. Update it when shipping major UI or architecture changes.*
