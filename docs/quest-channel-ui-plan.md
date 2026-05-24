# Quest Channel UI — Holistic Plan

**Version:** 1.0  
**Last updated:** 2026-05-24  
**Reference:** RPG quest mockup (8-screen flow)  
**Routes:** `/contracts`, `/contracts/[id]`, `/prepare`, hunt overlay via `ContractHub`  
**Aligns with:** [`visual-direction-v2.md`](visual-direction-v2.md), [`reference-mockup-integration.md`](reference-mockup-integration.md), [`prompts/master-session-prompt.md`](../prompts/master-session-prompt.md)

---

## 1. What this is (bigger than two pages)

The **Quest Channel** is not “a list page + a detail page.” It is the player’s **mission operations layer** inside NOZOMI: where story progression, daily contracts, side files, and achievements are browsed, committed to, and launched into the hunt pipeline.

It must feel like one continuous terminal mode:

```text
Home (identity) ──► Quest Channel (browse & commit) ──► Briefing (prepare) ──► Hunt (encounter) ──► Extraction (rewards) ──► Log (vocab / records)
```

Today these pieces exist but feel **disconnected**:

| Layer | Today | Target |
|-------|--------|--------|
| Shell title | Generic `QUESTS` / `CONTRACT` | Contextual: `MISSION LOG` → `FILE #{id}` → `DEPLOYMENT` |
| List vs hub | `/contracts` list **and** `ContractHub` dispatch duplicate “pick a quest” | Single catalog UX; hub dispatch becomes “resume active hunt” only |
| Story placement | Main story under **Weekly** tab | **Story** tab owns narrative arc + chapters |
| Detail → deploy | “Track” + “Deploy” (admin verbs) | One cinematic **ENTER DUNGEON** with cost + risk |
| Atmosphere | `HunterPage` + sparse copy | Dedicated `.nozomi-screen-quests` / `.nozomi-screen-contract` utilities |
| After run | Generic reward overlay | **Gate cleared** ceremony tied to quest channel return |

**Design principle (v2):** One psychological state per screen. The Quest Channel owns **evaluation & commitment** — not combat, not extraction euphoria.

---

## 2. Psychological arc (whole channel)

| Stage | Player feeling | UI job |
|-------|----------------|--------|
| **Browse** | “What is my path?” | Chapter rail, locked future, clear XP stakes |
| **Inspect** | “What am I signing up for?” | Hero art, objectives, reward preview |
| **Commit** | “I accept the risk.” | Stamina cost, readiness hint, single CTA |
| **Brief** | “Am I ready?” | Loadout / vocab briefing (prepare) |
| **Execute** | Pressure | Hunt overlay — no quest chrome |
| **Resolve** | Relief + pride | Gate cleared → return to channel with progress updated |

Secondary chrome (Request contract, achievements farming) must not compete with the **story spine** on the Story tab.

---

## 3. Information architecture

### 3.1 Route map

```text
/contracts
  ├─ QuestChannelShell (atmosphere + ops header)
  ├─ QuestChannelTabs: daily | story | side | achievements
  ├─ Tab content (chapter sections / lists)
  └─ Floating or inline: Request contract (daily/side only)

/contracts/[id]
  ├─ QuestFileDetail (breadcrumb, hero, body)
  ├─ Objectives + rewards
  └─ Sticky CTA: ENTER DUNGEON → /prepare?questId=

/prepare?questId=
  └─ DeploymentBriefing (readiness, loadout phase B)

/contracts (hubView=hunt) + EncounterHost
  └─ Full hunt — no list chrome

Post-complete
  └─ GateClearedScreen → /contracts?tab=story or /vocabulary?session=
```

### 3.2 Relationship to ContractHub

`ContractHub` on `/contracts` is the **runtime** layer (menu | hunt | dispatch | sector). The enhanced plan **narrows dispatch**:

- **Catalog & story** → new Quest Channel list UI (default view when `hubView === "menu"`).
- **Dispatch** → collapsed to “Active operations” strip: resume in-progress hunt, request new daily (not a second full list).
- Avoid two competing quest pickers (`ContractsClient` flat list vs `HubDispatchView` panels).

### 3.3 Relationship to Home

`/home` remains **identity & status**. Quest Channel carries **content progression**:

- Home: tracked contract teaser (keep) → links to `/contracts/[id]`.
- Quest Channel: full catalog; Story tab shows “continue” on current chapter mission.
- Do not duplicate full quest lists on Home.

---

## 4. Page composition (layout system)

### 4.1 Quest list — `/contracts`

Vertical zones (top → bottom):

```text
┌─────────────────────────────────────┐
│ A. Channel header (embedded, no card)│  Mission Log · system one-liner
├─────────────────────────────────────┤
│ B. Ops strip (compact)               │  Stamina · tracked file · Request
├─────────────────────────────────────┤
│ C. TabBar (4 tabs)                   │  Daily | Story | Side | Achievements
├─────────────────────────────────────┤
│ D. Tab hero (Story only, optional)   │  Current chapter banner + % 
├─────────────────────────────────────┤
│ E. Scroll body                       │  Chapter sections → quest cards
└─────────────────────────────────────┘
```

**Zone A — Channel header**

- `QuestChannelHeader`: display title “Mission Log”, optional `selectSystemMessage` subline (seeded per day).
- No “Missions · contract dispatch” muted line — replace with intentional copy.

**Zone B — Ops strip**

- `QuestOpsStrip`: stamina pill, tracked quest chip (if any), `Request` ghost button.
- Request only affects Daily/Side pools — hidden on Achievements tab.

**Zone C — Tabs**

- Reuse `TabBar`; consider scrollable tabs on very small widths if a 5th tab is added later.
- Persist `?tab=story` in URL for deep links from Home / notifications.

**Zone D — Story hero**

- `StoryChapterHero`: chapter title, overall progress ring, “Mission 02 of 05”.
- Only on Story tab when `mainStory` or chapter metadata exists.

**Zone E — List body**

- `StoryChapterSection`: sticky section label “Chapter 2 · Underground Line”.
- `StoryQuestCard` (extends list card): index, EN title, JP subtitle, progress bar, XP, LOCKED/active/complete states.
- Daily/Side: flat list without chapters; Achievements: existing `QuestListCard` claim pattern.

**CSS:** `.nozomi-screen-quests` — subtle purple floor gradient, tighter vertical rhythm than home.

### 4.2 Quest detail — `/contracts/[id]`

Single scroll column with **sticky footer CTA** (mockup pattern):

```text
┌─────────────────────────────────────┐
│ Back · Breadcrumb                    │
├─────────────────────────────────────┤
│ Hero (tall, themed art + vignette)   │
├─────────────────────────────────────┤
│ Title block (EN + JP + rank chip)    │
├─────────────────────────────────────┤
│ Flavor narrative (2–3 lines)         │
├─────────────────────────────────────┤
│ Objectives (checklist)               │
├─────────────────────────────────────┤
│ Rewards (icon grid)                  │
├─────────────────────────────────────┤
│ Readiness hint (optional, 1 line)    │
├─────────────────────────────────────┤
│ ▓▓ ENTER DUNGEON  ⚡10 ▓▓ (sticky)   │
└─────────────────────────────────────┘
```

- Remove duplicate title under hero (today: banner + h1).
- **Track contract** moves to overflow menu or ops strip — not equal weight to ENTER.
- `heroImageKey` / `dungeonTheme` from catalog metadata drives `HeroBanner`.

**CSS:** `.nozomi-screen-contract` — darker vignette on hero, scanlines light.

### 4.3 Shell integration

| Path | Header title | `AtmosphericBackground` |
|------|--------------|-------------------------|
| `/contracts` | `MISSION LOG` | `lobby` + `.nozomi-screen-quests` |
| `/contracts/[id]` | `CONTRACT FILE` | `lobby` + `.nozomi-screen-contract` |
| `/prepare` | `DEPLOYMENT` (existing PREPARATION) | `.nozomi-screen-prep` |

Optional: dim bottom nav slightly on detail (CSS only) to focus commitment CTA.

---

## 5. Component system (new / extended)

All presentation-only; data from systems listed.

| Component | Location | Purpose |
|-----------|----------|---------|
| `QuestChannelShell` | `features/contracts/components/` | Wraps list page zones A–E |
| `QuestChannelHeader` | same | Channel title + system line |
| `QuestOpsStrip` | same | Stamina, tracked, request |
| `StoryChapterHero` | same | Chapter progress header |
| `StoryChapterSection` | same | Section label + list |
| `StoryQuestCard` | `components/ui/screen/` | Reference-style horizontal card |
| `QuestFileDetail` | `features/contracts/components/` | Detail page layout |
| `MissionBreadcrumb` | `components/ui/screen/` | Main Story > Ch 2 > Mission 2 |
| `ObjectiveChecklist` | `components/ui/screen/` | Checkbox rows + fractions |
| `RewardIconGrid` | `components/ui/screen/` | Square reward tiles |
| `QuestDeployCTA` | `components/ui/screen/` | Sticky ENTER DUNGEON + stamina |
| `GateClearedScreen` | `features/dungeons/components/` | Post-run ceremony |
| `DungeonVocabLog` | `features/vocabulary/components/` | Session word list + START REVIEW |

**Extend (do not fork):** `QuestListCard`, `HeroBanner`, `TabBar`, `ScreenCTA`, `GlassCard`.

---

## 6. Data & systems (no UI logic)

| Concern | System / config |
|---------|------------------|
| MAIN vs SIDE, completed | `contractCatalogSystem` |
| Chapter grouping, JA titles, art | `missionCatalogMetadata.ts` |
| Lock / prerequisite | `questUnlockSystem.ts` (new, pure) |
| Progress % for cards | `questPresentationSystem` |
| Tracked quest | `contractTrackingSystem` |
| Stamina on CTA | `staminaSystem` + dungeon def |
| Readiness one-liner | `readinessSystem` |
| Story chapters builder | `buildStoryChapters(catalog)` in `contractCatalogSystem` or `questPresentationSystem` |

Optional contract fields only when persistence required; prefer catalog overlays for v1 story content.

---

## 7. In-run & post-run (mockup screens 3–8)

These are **downstream of the channel** but must share the same visual language (purple glow, embedded panels, gold extraction).

| Screen | Component / route | Notes |
|--------|-------------------|-------|
| Deployment briefing | `PrepareClient` + `.nozomi-screen-prep` | Phase A: polish layout; Phase B: `LoadoutSlotGrid` |
| Listening run | `ListeningEncounter` + `ListeningStationDisplay`, `AudioWaveform` | Borderless; timer + objective rail in HUD |
| Word extraction | `WordExtractionPanel` | Tabs: New / Reviewed; `WordRarityChip` |
| Comprehension | `ComprehensionChoiceList` | Shared by listening + vocab MC |
| Gate cleared | `GateClearedScreen` | Grade, accuracy, mastery delta; then route to channel |
| Dungeon vocab log | `/vocabulary?session=` or Records subsection | START REVIEW → existing review flow |

---

## 8. Motion & navigation

- **Tab switch:** cross-fade content, 150ms (`MOTION.panel`).
- **Card → detail:** shared layout id on hero + title (`framer-motion` layoutId) optional Phase 2 polish.
- **Detail → prepare:** slide up CTA feedback; shell title changes to DEPLOYMENT.
- **Complete → channel:** replace stack with Gate cleared → auto-navigate to Story tab with updated progress.
- **Deep links:** `/contracts?tab=story`, `/contracts/[id]`, Home tracked card → detail.

---

## 9. Implementation phases (merged & ordered)

### Phase 0 — Foundation (half day)

- [ ] Add `docs/quest-channel-ui-plan.md` (this file) to reference-mockup-integration.md blurb
- [ ] CSS: `.nozomi-screen-quests`, `.nozomi-screen-contract` in `globals.css`
- [ ] Shell titles: `MISSION LOG`, `CONTRACT FILE` in `HunterShellLayout`
- [ ] URL tab state: `?tab=` on `/contracts`

### Phase 1 — Quest Channel shell & list (1–2 days)

**Goal:** List page feels like the mockup’s Quests screen.

- [ ] `QuestChannelShell` + header + ops strip
- [ ] Tabs: `daily | story | side | achievements` (migrate weekly → story)
- [ ] `StoryQuestCard` with index, JP subtitle, lock, progress, XP
- [ ] `StoryChapterSection` + `StoryChapterHero` (static metadata for one chapter arc)
- [ ] Wire `buildContractCatalog` + placeholder chapter metadata for tutorial/main quest

### Phase 2 — Quest file detail (1 day)

**Goal:** Detail page matches mockup commitment screen.

- [ ] `QuestFileDetail` layout with sticky `QuestDeployCTA`
- [ ] `MissionBreadcrumb`, themed `HeroBanner`
- [ ] `ObjectiveChecklist`, `RewardIconGrid`
- [ ] CTA → `/prepare?questId=`; stamina from linked dungeon config
- [ ] Demote “Track” to secondary action

### Phase 3 — Catalog & unlocks (1 day)

- [ ] Expand `missionCatalogMetadata.ts` (chapter, sort, titleJa, heroImageKey, prerequisite)
- [ ] `questUnlockSystem.ts` + locked cards
- [ ] `buildStoryChapters()` for Story tab

### Phase 4 — Hub deduplication (0.5 day)

- [ ] Align `HubDispatchView` with channel (resume hunt only; no duplicate catalog)
- [ ] Default `/contracts` to channel view when `hubView === menu`

### Phase 5 — Deployment & in-run polish (2–3 days)

- [ ] `PrepareClient` visual pass (build name, buff lines, dungeon info block)
- [ ] `LoadoutSlotGrid` when equip API ready
- [ ] Listening station + waveform + seek controls
- [ ] `WordExtractionPanel` + rarity chips
- [ ] `ComprehensionChoiceList`

### Phase 6 — Extraction & log (1–2 days)

- [ ] `GateClearedScreen` wired to completion payload
- [ ] `DungeonVocabLog` + START REVIEW
- [ ] Return path to `/contracts?tab=story`

### Phase 7 — Docs & contracts (ongoing)

- [ ] Update `flows/quest-flow.md`, `reference-mockup-integration.md`, `terminology.md`
- [ ] Extend `quest-contract.ts` only if persisted fields added
- [ ] Changelog entry per release slice

---

## 10. Success criteria

- [ ] Player can understand story progression without reading system docs
- [ ] One obvious action on detail: **ENTER DUNGEON**
- [ ] List and detail share atmosphere (embedded panels, purple environmental light)
- [ ] No duplicate quest pickers between channel and dispatch
- [ ] Hunt/extraction screens do not show quest list chrome
- [ ] All gameplay rules remain in `/systems`; components are presentation-only

---

## 11. Reference mockup mapping (quick)

| Mockup | Phase |
|--------|-------|
| Quest list (tabs, chapters, cards) | 1, 3 |
| Quest detail (hero, objectives, rewards, CTA) | 2 |
| Dungeon prep | 5 |
| Listening / words / quiz | 5 |
| Gate cleared | 6 |
| Dungeon vocab log | 6 |
