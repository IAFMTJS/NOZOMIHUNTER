# Changelog

## v1.6.0 (unreleased) — Immersion wave 2 + runner split

### Architecture
- `DungeonRunnerEncounterBody` — phase/encounter UI extracted from `DungeonRunner`
- `dungeonFailureCeremonyFlow` — ceremony open logic + E2E test id export

### Immersion
- Contract board tab motion (`ContractChannelMotion`, stagger CSS)
- Archive entries link to contracts (`archiveContractSystem`, recover CTAs)
- NPC dialogue branch persisted (`npc_relationships.last_dialogue_branch`, migration 017)
- Authenticated audit checks `dungeon-failure-ceremony` when FAILURE run active

### Tests
- `dungeonFailureCeremonyFlow.test.ts`, `archiveContractSystem.test.ts`

## v1.5.1 (unreleased) — Platform integrity + immersion wave 1

### Learning integrity (M1)
- `encounterDisplayPolicy` — conversation-only quests skip recall masking; router shell uses policy
- `useHunterHydration` + `HunterSessionGate`; Hunter session import fixes
- `tests/encounterDisplayPolicy.test.ts`, `tests/speechGuard.test.ts`
- `ContractsStoryChannel`, `DungeonRunnerFailureOverlay` extractions
- Removed duplicate `useSpeechEncounter` (canonical: `useSpeechEncounterController`)

### Immersion (M2)
- Landing fog/rain (`LandingWeatherLayer`)
- Dungeon sector entry tension (`DungeonEntryTension`, `dungeonEntryPresentation`)
- Contract channel kickers (`contractChannelPresentation`)
- UX audit status + historical doc banners on legacy roadmaps

### World / archive / contacts (M3–M4 slice)
- World map corruption index bars; archive lore excerpts
- NPC dialogue branches on `/contacts` (`contactDialogueSystem`)
- `HunterIdentityStub` on profile

### Tooling (M5)
- `authenticated-audit.mjs` — `/map`, `/archive`, `/contacts`

## v1.5.0 (unreleased) — Architecture foundation + immersion wave 0

### Architecture (M0)
- Split `dungeonOrchestrator` into flow modules + thin facade
- `encounterModeRegistry` extracted from `EncounterRouter`
- Hunter session hooks: `useHunterHubState`, `useHunterCeremonies`, `useHunterRewardClaim`
- Shared context re-exports under `src/context/encounters`
- `missionTrackingRepository` — no `createClient` in feature service
- `check-architecture` warns on systems files > 300 lines
- Vitest: `dungeonOrchestratorFlows`, `learnerDisplayCompliance`

### Immersion (partial M1–M2)
- Landing whispers + time-of-day (`landingAmbienceSystem`, `LandingWhispers`)
- Routes: `/map`, `/archive`, `/contacts`
- Contract channel narrative labels; training discipline skins
- Home hub: collapsible operational feed
- `DungeonFailureCeremony` component
- Docs: `immersion-rework-masterplan.md`, `ux-audit-status.md`, registry/architecture v1.5

## v1.4.1 (unreleased) — UX audit remediation

### JMDict vocabulary (full curated integration)
- **215** JMdict-sourced curated entries (`src/data/jmdictCurated.generated.ts`) — RPG + N5–N3 core; real `ent_seq` ids
- Manifest: `content/jmdict-curated-manifest.json`; regenerate via `npm run build:curated -- --download` or `npm run build:curated -- data/JMdict_e.xml`
- All encounter/training/brew/Threat Index paths use `getVocabularyCatalog()` / `getCatalogEntries()` (DB merge when ingested)
- `JMDICT_DB_LOAD_LIMIT` (2000) for Supabase vocabulary extend; romaji index sync via `setReadingAnnotationCatalog`
- `tests/jmdictCurated.test.ts` — pool size, ent_seq, encounter shape

### Theming
- Color tokens grouped under dark mode (`src/styles/themes/dark.css`) with parallel light palette (`light.css`, 188 matched keys)
- Presentation utilities in `presentation.css` — zero hardcoded colors; all `var(--*)` theme tokens
- `npm run check:theme` — parity + no hardcoded hex/rgba in UI source
- Overlay classes migrated (`bg-white/5` → `var(--overlay-subtle)`, etc.)
- `rules/theme-rules.md`: new UI must define colors in both dark and light token files
- Settings toggle: Profile → Settings → **Light mode** (`localStorage` + `data-theme` on `<html>`)

### Learning hints
- Layered hint system: Hunter Vision (hold-to-reveal), companion whispers, radical glyph lore
- `hintSystem`, `EncounterHintProvider`, encounter controls on vocab / listening / speech
- Staged mastery policy; auto reinforcement whisper after repeated wrong answers
- `flows/hint-system-flow.md`, `contracts/hint-contract.ts`

### Flow blockers
- Guest sign-in gated by `NEXT_PUBLIC_ENABLE_GUEST_AUTH` (default off); README documents login paths
- `resolveQuestRecord` — story/catalog contract detail resolves active, regular, and completed snapshots
- Vocabulary mastery updates refresh active quest preparation scores (`refreshVocabularyPreparationForActiveQuests`)
- Training quests skip vocab prep on accept; critical readiness bypass for training deploy
- Training **Play** → `/prepare` (no premature encounter overlay); deploy opens hunt on `/training` with focused drill quest (no active-dungeon hijack)
- Dungeon `chooseDungeonRoute` from `REWARD` uses `REWARD → EXPLORATION` before sector engage
- Dungeons hub: active-run banner with **Resume corridor** + **Abandon** (list no longer blocked by auto sector overlay)
- `EncounterHost` no longer forces `hubView === "sector"` when visiting `/dungeons`; overlay only after deploy / resume
- **Abort dungeon** available in `PREPARATION` (and all non-extraction states); friendlier invalid-transition copy in `DungeonRunner`

### UX polish
- `HunterSession` hydration messaging; login skeleton
- `ScreenCTA` z-index above bottom nav; reduced duplicate scroll padding on contract/prepare screens
- QA `data-testid` hooks (`src/config/e2eTestIds.ts`) on training play, contract request, prepare deploy, dungeon enter/resume/abandon/abort, encounter transmit
- Middleware protects `/settings`, `/training`, `/records`
- Channel-aware mission breadcrumbs and CTA labels (`Deploy contract` / `Enter sector` / `Start drill`)
- Home operational alerts link to recovery routes; prepare screen recovery links
- Completed story detail read-only mode
- Settings duplicate Audio row removed; dev-only Supabase hint on login
- Neon Corridor copy: “An unstable sector…”

### Documentation
- `docs/DECISIONS.md` — readiness, dungeon REWARD, guest auth, completed story detail
- `flows/navigation-flow.md` — training bypass, dungeon REWARD path, abandon recovery, auth notes

### Tests
- `tests/resolveQuestRecord.test.ts`
- `tests/readinessDeployPolicy.test.ts`
- `tests/dungeonRewardRoute.test.ts`
- `tests/vocabularyPreparationRefresh.test.ts`

## v1.4.0 (unreleased) — Dungeon V2 + Dungeon Masters

### Dungeon Masters overlay
- `dungeon-master-contract.ts` + `dungeonMastersConfig.ts` — eight master personas mapped to all six dungeon keys
- Systems: `dungeonMasterSystem`, `dungeonMasterDialogueSystem`, `dungeonMasterRuleSystem`, `dungeonMasterMemorySystem`
- Presentation: `dungeonMasterPresentation`, `dungeonDomainPresentation`; reactive dialogue on deploy, routes, mistakes, boss, extraction
- UI: `DungeonDomainBackdrop`, `DungeonMasterPresence`, `BossPhaseOverlay`, `BossIntegrityBar`, `CorruptionDistortionLayer`, `MasterDialogueLine`
- Perfect-clear grants: titles, relic items, relationship keys (`master:{id}:{state}`)
- Achievements: Gatebreaker, Archive Breaker, master rival
- `flows/dungeon-masters.md`

### Dungeon V2 systems
- Extended `dungeon-contract.ts`: route graph, threat meters, combat actions, boss phase specs, extraction choice, run summary
- `dungeonRouteSystem`, `dungeonThreatSystem`, `dungeonActionSystem`, `dungeonBossSystem`, `dungeonRewardSystem`, `dungeonRunSummarySystem`
- `dungeonOrchestrator` v2 paths: route choice, threat consequences, 3-phase boss, extract vs push deeper
- Presentation: `dungeonRunPresentation`, `dungeonThreatPresentation`, `dungeonBossPresentation`; `DUNGEON_CONSEQUENCE_COPY`

### Shadow Archive (`dungeon:shadow-archive`, `runSchemaVersion: 2`)
- Route graph + **The Archivist** 4-phase boss (Recall → Repair → Intruder → Seal)
- Memory Debt rule on vocab encounters

### All sector dungeons V2
- `dungeonV2OverlayConfig.ts` — route graphs for abyss-core, corruption-run, void-pursuit, roguelike-sector

### Neon Corridor (`dungeon:neon-corridor`, `runSchemaVersion: 2`)
- 6-node route graph (entry → Neon Hall / Archive Door → Boss Gate)
- Run meters: corruption pressure, boss awareness, signal stability, hunter focus
- Combat actions: STRIKE / SEAL / FOCUS (level-gated) mapped to `ChallengePromptDirection`
- One rolled modifier per run (BLACKOUT, ECHOING WALLS, ARCHIVE FOG, HUNTER'S MARK)
- Boss **Neon Warden**: Index Scan → Reading Repair → Archive Seal (3 phases)
- Extraction choice: safe extract vs push deeper (bonus vocab encounter)
- UI: `DungeonThreatHud`, `DungeonRouteMap`, `DungeonActionBar`, `DungeonModifierRail`, `ExtractionDecisionPanel`, `DungeonRunRecap`, `BossPhaseBanner`

### Tests
- `tests/dungeonV2Systems.test.ts` — route, threat, actions, persistence shape
- `tests/dungeonMasterSystems.test.ts` — dialogue, rules, memory grants, awareness tiers

### Documentation
- `flows/dungeon-flow.md` — V2 loop documented
- `docs/system-registry.md` — dungeon V2 system entries
- `docs/current-architecture.md` — Neon Corridor V2 status

## v1.3.0 (unreleased) — Gameplay evolution integration

### Quality gates (Codex audit fixes)
- `LISTEN_DECODE` accepts romaji, kana, and kanji answers in `answerValidationSystem`
- `GateClearedStats` moved to `ceremonyTypes` (systems no longer import dungeon feature types)
- `trainingActions` facade; `TrainingClient` avoids direct lifecycle import
- `tests/helpers/mockPlayerContract.ts` for strict TypeScript-safe player stubs
- Achievement/sync ceremony effects use stable fingerprints (`achievementUnlockSnapshot`)
- Memory Cascade reveal timer keyed via `useMemo` word sequence
- Speech: pronunciation vs meaning acceptance split; `scoreMeaningComprehension` exported

### Documentation sync (v1.3.2)
- Canonical game-feel flow: `flows/gamefeel-ceremonies.md` (mirror under `docs/flows/`)
- Updated `flows/navigation-flow.md`, `dungeon-flow.md`, `presentation-flow.md`, `training-modes-flow.md`, `quest-flow.md`, `xp-flow.md`
- `docs/current-architecture.md`, `docs/system-registry.md`, `docs/nozomi-product-spec.md`, `docs/visual-direction-v2.md`
- Fixed broken `achievementSystem` registry header; expanded `hunterSessionLayer` and `trainingMissionSystem` entries

### Game feel (implementation pass — plan complete)

- `EncounterFeedbackContext` consumes orchestrator `audioCues` + `freezeMs`; dungeon in-run provider on `DungeonRunner`
- Encounter answer audio removed from `registerAudioHandlers` (provider-owned)
- Training mini-games: Memory Grid (pair match), Echo Listening (chunk reconstruction), Shadow Typing (prompt decay), Survival (1-strike waves)
- `AchievementUnlockCeremony` slam + freeze; `MasteryTierUpCeremony` queue in `HunterSessionContext`
- Tiered `RewardClaimOverlay` motion classes; card hierarchy (`RoutineCard`, `OperativeCard`, `SectorCard`, `ThreatCard`)
- Dungeon HUD atmosphere + failure consequence copy; boss collapse theme CSS

### Game feel (full plan)
- Spec: [`docs/nozomi-hunter-ui-gamefeel-progression-feedback.md`](docs/nozomi-hunter-ui-gamefeel-progression-feedback.md), [`contracts/presentation-contract.ts`](contracts/presentation-contract.ts), [`docs/flows/gamefeel-ceremonies.md`](docs/flows/gamefeel-ceremonies.md)
- `encounterFeedbackOrchestrator` + `EncounterFeedbackProvider` / `EncounterImpactLayer` on all `EncounterRouter` paths
- `momentFreezeSystem`, `hapticsSystem`, ceremony slam overlay, `BossCollapsePhase`, `DungeonClearCeremonyFlow` with XP aftermath
- `AchievementUnlockCeremony` + `ACHIEVEMENT_UNLOCKED` / `MASTERY_TIER_UP` events
- Tier-sized `RewardClaimOverlay` shells; enhanced level-up typography
- Training arcade UI (`ArcadeCard`); modes: Echo Listening, Shadow Typing, Memory Grid, Survival Vocab
- Card variants (`RoutineCard`, `OperativeCard`, `ThreatCard`, `SectorCard`, `ArcadeCard`); `uiTokens.ts`
- Dungeon depth escalation classes, strike HUD, `data-dungeon-theme`
- Removed orphan `LevelUpNotice`, unused `ExtractionCeremony`

### Game feel (update2)
- Ceremony layer: fullscreen `LevelUpCeremony`, `DungeonClearCeremony`, `SequentialRewardReveal`, tiered `RewardClaimOverlay` (daily light / story+dungeon sequential)
- Encounter impact: `ComboMeter`, combo milestone audio (`combo2`/`combo5`/`comboBreak`), wrong-answer glitch CSS
- Vocabulary: `MasteryTierBadge` + per-tier card glow on threat index
- Quest channel screen utilities (daily / story / side list differentiation)
- Dungeon: corridor atmosphere classes, escalation HUD copy, failure consequence toasts
- Training: new `KANA_DASH` mode; Shadow Echo decay timer; Memory Cascade grid layout

### Design
- Adopted [`docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md`](docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md) as north star for mechanical differentiation
- Mode-aware core loop in `docs/core-loop.md`; system differentiation rules in `rules/gameplay-rules.md`
- Semantic linking game mode code name: `SEMANTIC_NETWORK` (UI Threat Index unchanged)

### Platform
- `GameModeId` contract + `gameModeRegistry` + `EncounterRouter`
- Quest/dungeon `gameMode` snapshot persistence; analytics `game_mode` payload

### Modes (see system-registry)
- Training: Signal Calibration, Kana Dash, Kanji Surgery, Memory Cascade, Shadow Echo, Echo Listening, Shadow Typing, Memory Grid, Survival Vocab
- Quest: Terminal Breach, Ghost Interrogation, Lost Transmission
- Dungeon: Corruption Run, Void Pursuit, Roguelike Sector, Archivist boss
- Contract: Deep Cover, Panic Channel
- Vocabulary: Entity Hunt, Semantic Network

### Cross-cutting
- Expanded system message pools; tiered corruption presentation; audio ambience layer
- Blackout assist level on player progression
- Operational home feed rails
- **Challenge display overhaul** (`challengeDisplaySystem`, `encounterPressureSystem`): dynamic information masking on vocab/listening/speech encounters; locked input modes; target-lock streak feedback; post-success reveal animation
- **Listening**: masked station intercept, mic tap-to-play in focus shell, replay degradation copy
- **Speech**: default `ja-JP` recognition, kana/kanji normalization, meaning-only prompts
- **Dungeon corridor**: hold-to-listen channel (1.8s), flex-safe action buttons, LISTEN vs PUSH intel divergence
- **Conversation**: response families in config, trust deltas, neutral placeholder (no answer leak)
- **Audit follow-up**: shared `answerValidationSystem`; legacy quest patch for challenge fields; vocab pressure UI; per-wrong corruption tick; `player` on training-mode wrappers; flow/architecture doc sync
- **Deferred polish**: corridor ambient audio; extraction mastery recap; encounter streak XP multiplier on completion; `CHALLENGE_REVEALED` / `REPLAY_PENALTY` analytics; director style variants in `dialogueOrchestrator`; PUSH corridor corruption tick

### Retention (flagged)
- Corrupted language validators; live sector events; language invasions; dual operator scaffold

## v1.2.3 (unreleased) — Updates 2405 integration

### Critical gameplay
- **Daily vs Side quests** — separate `DAILY` narrative tier, `dailyQuestSystem`, channel-aware `requestNewQuest`
- **Progression softlock** — stat growth on completion, starter bootstrap (dungeons + inventory), softened prepare checklist, `/training` drills
- **Listening** — submit requires listen first; skip token blocked on listening; mastery on correct decode
- **Quest data** — playability check + corrupted-mission fallback copy
- **Vocabulary tabs** — Threats (default) / Conquered / All via `vocabularyCatalogSystem`

### Global learner UX
- **`LearnerWordLine` + `WordAudioButton`** — Japanese / romaji / meaning + TTS on vocab list, detail, prep tiles
- **Memory decay** — instability % from `last_seen_at` on threat index

### Economy
- **Inventory sell** — sell items for credits at 50% of catalog price (`sell_item_guarded`, `?mode=sell`)

### Immersion
- **Home** — hunter power summary (total + battle stats) with link to `/stats`
- **Mission cards** — sector blurbs and danger tier on daily/side contracts
- **Profile** — registry status rail, penalty/sync widgets, system module cards
- **Reactive feedback** — XP / penalty / glitch toasts via `ReactiveFeedbackHost`
- **Threat visuals** — CSS pulse tiers on vocab rows; fatigue-high shell blur

### Audit closure (v1.2.3 follow-up)
- Docs/registry/flows/contracts synced; DECISIONS ADRs for daily tier and bootstrap
- `LearnerWordLine` + TTS on vocab/speech encounters, extraction panel, dungeon log
- `QuestFileDetail` mission ops block; corrupted contract detail + pool guard
- Channel system messages; training link on ops strip; `eventBus.off`; reduced-motion toasts
- Training quests excluded from catalog; SIDE reward tier fix; instability threat bump

### Audit gap closure
- `EncounterRailWord` on vocab/speech target rails; learner-display rules updated
- `questEncounterRebuild` split from `questEncounterRepair`; registry entries for pool guard + rebuild
- `registerAudioHandlers` returns unsubscribe; SIDE &lt; MAIN XP test

### Docs & tests
- `rules/learner-display-rules.md`, migration `014_starter_bootstrap.sql`, `tests/updates2405Systems.test.ts`

## v1.2.2 (unreleased) — shop remediation + reference gap closure

### Quest Channel UI (full mockup pass)

- **Mission log** (`/contracts`) — `QuestChannelShell`, tabs Daily / Story / Side / Achievements, chapter sections, `StoryQuestCard`, ops strip (stamina, tracked, request), URL `?tab=`
- **Contract file** (`/contracts/[id]`) — `QuestFileDetail`: breadcrumb, themed hero, objectives checklist, reward icon grid, sticky **Enter dungeon** CTA
- **Systems** — `storyChapterSystem`, `questUnlockSystem`, `missionCatalogMetadata` overlays, `questRewardPresentation`, `gateClearedPresentation`
- **Deployment** (`/prepare`) — loadout grid, sector briefing block, enter dungeon CTA copy
- **In-run** — `ListeningStationDisplay`, `AudioWaveform`, `WordExtractionPanel`, `WordRarityChip`
- **Extraction** — `GateClearedScreen` in reward overlay; **dungeon vocab log** at `/vocabulary?session=last`
- **Hub** — dispatch deduped to resume-hunt + link to mission log; shell titles MISSION LOG / CONTRACT FILE / DEPLOYMENT
- **CSS** — `.nozomi-screen-quests`, `.nozomi-screen-contract`
- Docs: [`docs/quest-channel-ui-plan.md`](docs/quest-channel-ui-plan.md)

### Shop economy remediation
- **Server completion boosts** — `013_completion_boosts.sql` applies fatigue, XP boost, reward amplifier, and system breach in `complete_quest_guarded`; consumes boosts atomically
- **Catalog dedupe** — `item_catalog.effect_duration_ms` / `effect_uses`; `use_consumable_guarded` reads catalog instead of hardcoded cases
- **Feature layer** — `shopEffectActions.ts`; components use actions not lifecycle imports
- **Events** — `SHOP_PURCHASED`, `BOOST_ACTIVATED`, `XP_CONVERTED` registered in `eventHandlers`
- **Cosmetics** — title unlock + shop aura CSS on hunter portrait
- **Dungeon timer** — countdown in `DungeonRunner`; timeout on encounter submit
- **Architecture guard** — systems→features and components→lifecycle checks in `check-architecture.mjs`

### Reference gap closure (phases 2–4)

- **Visual v2 pass** — home discipline teaser, missions dispatch (`HeroBanner`, contract type icons), dungeon locked overlay, embedded panels on vocab/inventory/stats/reward overlay, corruption warning tone on system status
- **Presentation CSS** — rank header tints, deploy caution/risky, listening pulse rings, dungeon locked, menu denial copy
- **Hub & prep** — menu denial lines, deploy CTA classes from `hunterPresentation`, `HunterPageBack` transition line
- **Listening** — `waveformLevels` pseudo-analyser in `useJapaneseTts`, pulse rings in `ListeningFocusShell`
- **Profile dossier** — `HeroBanner` codename header, collapsible registry titles, settings as registry controls
- **Settings** — `/system` link, corruption ambient audio toggle (`nozomi-corruption-audio`)
- **Encounter copy** — THREAT labels, Transmit verbs, conversation channel header
- **Navigation** — bottom nav label **Missions** (route `/contracts` unchanged)
- **Exploration** — `explorationSystem` beats + system lines (phase 1, documented)

## v1.2.1 (unreleased)

- **Shop & economy** — black market rotation, rarity tiers, XP→credit conversion, consumable boosts (`011_shop_economy.sql`); `boostSystem`, `xpConversionSystem`, `shopRotationSystem`; enhanced `/inventory` shop UI
- **Shop effect hooks** — quest retry, skip token, system breach rewards, revive/escape/time-freeze (`012_shop_effect_hooks.sql`, `shopEffectSystem`)
- **Navigation** — `EncounterHost` no longer pins ContractHub on every `/contracts` visit or on all routes during an active dungeon; overlay only on deploy + encounter base routes

## v1.2.0 (unreleased) — reference parity

- **RPG stats** — `RpgStatsContract`, `rpgStatsSystem`, migration `010_rpg_stats.sql`, `/stats` page, power integration
- **Routes** — `/settings`, `/records`; `/stats` restored (language metrics remain on `/profile#operator-metrics`)
- **UI kit** — `HeroBanner`, `RankChip`, `StatBar`, `ItemTile`, `RewardRow`, `SystemCrest`, `CollapsibleSection`, `ListeningFocusShell`
- **Screens** — visual pass on contracts, dungeons (incl. Abyss Core), preparation, vocabulary (mark learned), inventory (manage mode), system crest, reward overlay
- **Systems** — `contractCatalogSystem`, `contractTrackingSystem`, `recordsPresentationSystem`, `recordsRepository`
- **Listening** — focus mode with orange accent and tap-to-stop
- Docs: `flows/rpg-stats-flow.md`, reference map and release checklist updates

## v1.1.0 (unreleased) — architecture remediation

- **Dead XP path removed** — `questOrchestrator.completeQuest` and client `applyQuestReward`; guarded RPC only
- **Unlock key** — `dashboard` → `home` (migration `008_unlock_home_key.sql`, hydrate normalize)
- **Legacy shell removed** — `DashboardClient`, `HunterShell`, `HunterAppShell`
- **Command node** — `features/hub/` with `HubMenuView`, `HubHuntView`, `HubDispatchView`, `HubSectorView`
- **Routes** — `/contracts` (+ redirects from `/missions`); `/stats` → `/profile#operator-metrics`
- **Session** — `useHunterReadiness`, readiness/forecast on `HunterSessionContext`
- **Events** — `GAME_EVENTS` moved to `contracts/event-contract.ts`
- **Encounters** — `encounterSubmitAdapter` shared by quest/dungeon actions
- **Tests** — Vitest (`npm run test`) for validator, readiness, reward calc
- **Copy** — terminology pass (dashboard/grid → hunter system language)
- Docs: `compliance-audit-v1.1.md`, `release-checklist.md`, architecture/flow updates
- **Compliance pass (7→10)** — shop (`purchase_item_guarded`, `/inventory` Loadout+Shop); equip loadout; prepare deploy gate; `markLearned` removed; server `apply_daily_stamina_guarded`; dungeon `staminaSpent` + abort refund; reward claim error handling; `achievementSystem` + `/achievements`; `completionService` in features layer; `npm run check:architecture`; migration `008_shop_and_guards.sql`

## v1.0.0 (unreleased) — mockup shell integration

- **Audit fixes** — `activityCompletionOrchestrator` (shared quest/dungeon completion + DB hydrate); migration `007_economy_fixes.sql` (stamina JSONB unlock, refund RPC, hidden-objective completion); safe dungeon enter order; `missionTrackingService`; daily stamina regen; quest credits/items/tiers; completed missions UI; dungeon loot preview; PWA `/home` cache; expanded Zod schemas
- **Architecture docs** — `current-architecture.md`, `system-registry.md`, flows, and `supabase-setup.md` synced to v1.0 routes and economy layer
- **Mobile shell** — `HunterShellLayout`, `HunterPage`, `BottomNav`, route group `(hunter)` with `/home`, `/missions`, `/dungeons`, `/inventory`, `/profile` (+ `/prepare`, `/vocabulary`, `/stats`, `/system`)
- **Hunter session** — `HunterSessionProvider` + `useHunterSession`; `EncounterHost` for hunt/sector overlays
- **Economy** — migration `006_economy_inventory.sql`: credits, stamina, brew tokens, inventory, tracked mission, guarded RPCs
- **Systems** — `hunterPowerSystem`, `staminaSystem`, `inventorySystem`, `brewSystem`, `missionCatalogSystem`, `missionTrackingSystem`, `rewardClaimSystem`, `preparationChecklistSystem`
- **Screens** — home, missions list/detail, dungeons list/detail, preparation ring, vocabulary + brew, inventory grid, stats, system status, `RewardClaimOverlay`
- **Redirects** — `/dashboard` → `/home`; PWA `start_url` `/home`; auth callback → `/home`
- Docs: [`docs/reference-mockup-integration.md`](docs/reference-mockup-integration.md), [`flows/navigation-flow.md`](flows/navigation-flow.md), [`flows/economy-flow.md`](flows/economy-flow.md)

## v0.9.0 (unreleased)

- **Portrait layers** — procedural silhouette, rank ring, corruption scanlines, sync-at-risk ring (`HunterPortrait`)
- **Sector breach map** — `dungeonSectorMapSystem` + `SectorMapRail` replaces flat corridor list; readiness deploy advisory (confirm when under advisory)
- **Threat metadata** — boss/sector-critical word ids in `vocabularyThreatMetadata.ts`
- **Visual v2 hub screens** — `HubScreenFrame` + atmosphere classes for hunt / dispatch / sector
- **Encounter copy** — Transmit / Deploy / Breach sector terminology alignment
- **Hunter identity** — codename + registry ID (`hunterIdentitySystem`), dossier UI on command node and `/profile`
- **Discipline synchronization** — chain tracking, at-risk/broken states, milestone titles (`title:discipline-*`); migration `005_hunter_identity_sync.sql`
- **Operational readiness** — `readinessSystem` (penalties, listening, vocab prep); `ReadinessSummary` on hunter status
- **Dungeon forecast** — `dungeonForecastSystem` + `NextGateForecast` (“next gate” / threat anticipation)
- **System messaging** — `systemMessagingSystem` + `SystemMessageRail` on hunter status menu
- **Vocabulary threat intel** — `vocabularyThreatSystem`; briefing shows threat tiers (not raw importance)
- **Hunter presentation** — rank aura, corruption portrait, sync-at-risk (`hunterPresentationSystem` + CSS)
- Docs: [`docs/terminology.md`](docs/terminology.md), gap analysis updated in [`docs/missing-systems-and-reference-analysis.md`](docs/missing-systems-and-reference-analysis.md)

## v0.8.1 (unreleased)

- **Visual direction v2** — purple tactical palette, embedded panels, vertical command node layout
- [`docs/visual-direction-v2.md`](docs/visual-direction-v2.md) active spec; PWA theme `#05070b`
- `Panel`: borderless embedded tones + `reward` for progression notices
- `HunterShell` / `HomeTerminal` / `ContractHub` atmosphere and spacing pass
- Screen passes: mission prep (vertical briefing), listening (signal well), extraction (reward tone), dungeon navigation, dashboard single-state overlays via `hubView`

## v0.8.0

- Hunter profile (`/profile`): stats, penalties, unlock registry labels
- `ExtractionCeremony` staged dungeon extract UI with themed audio hooks
- `RankUpNotice` + `UnlockNotice` on progression rewards
- `themedAudioSystem` — optional `/public/audio` MP3s, procedural fallback
- `HunterShell` profile link; safe-area utilities (`pt-safe`, `pb-safe`)

## v0.7.2

- PWA: `manifest.ts`, `public/icons/icon.svg`, iOS `appleWebApp` + `viewportFit: cover`
- `InstallPrompt` (beforeinstallprompt + iOS Add to Home Screen copy)
- `public/sw.js` — cache static assets; `ServiceWorkerRegister` (production)
- Docs: [`docs/mobile-pwa.md`](docs/mobile-pwa.md)

## v0.7.1

- Second dungeon: **Shadow Archive** (`dungeon:shadow-archive`), unlocked from Neon Corridor extract
- `penaltyGameplaySystem`: corruption → fewer wrong attempts, listening replays, dungeon failure budget; fatigue −1 on complete
- `dungeonAccess.resolveDungeonAccess` + `DungeonCorridorCard` locked/available states
- Listening dispatch gated on `system:listening` (granted at level 2 on hydrate); extra quest variants

## v0.7.0

- **Unlock fix**: `resolveQuestCompletion` merges reward unlocks in `finishQuest` / `extractDungeonRewards` before save
- `UNLOCK_GRANTED` event; `unlockRegistry` + `UnlockNotice` queue in player store
- Starter corridor `dungeon:neon-corridor` in `defaultProgression`

## v0.6.8

- Listening contracts on the board (level 2+); Japanese TTS via `japaneseTtsSystem` — no prerecorded audio
- `ListeningEncounter`: receive/replay signal, waveform UI, no on-screen meaning leak
- Command node hub (`ContractHub`): menu → hunt / dispatch / dungeon sector (progressive disclosure)
- Landing: `HomeTerminal` boot sequence + “Initialize hunter”
- Listening answers advance objectives; emit correct/wrong events

## v0.6.7

- Game feel: lobby atmosphere on contract board (`HunterShell` + `AtmosphericBackground` lobby variant)
- Hunt mode: auto-focus `EncounterFocusShell`, encounter backdrop, combat copy (Confirm lock, Transmit, Abort)
- Encounter feedback: `EncounterFeedback`, flash animations, animated target rail and dialogue bubbles
- Penalty atmosphere: corruption scanlines/glitch, fatigue-slow transitions, XP debt on `XPBar`, `corruption`/`boss` panel tones
- Dungeon UI: `DungeonPhaseStepper`, `DungeonCorridorRail`, boss nameplate panel, focus shell during sectors
- Audio: `audioSystem` (Web Audio), `registerAudioHandlers`, mute toggle; events `ENCOUNTER_ANSWER_CORRECT` / `ENCOUNTER_ANSWER_WRONG`
- Systems: `penaltyPresentationSystem`, `motionPresets`; emits from vocabulary/conversation/speech encounter systems

## v0.6.6

- `complete_quest_guarded` RPC: server validates quest objectives on stored snapshot, grants capped XP, marks quest completed
- `apply_guarded_progression` now rejects XP changes on autosave (XP only through quest completion RPC)
- Analytics events persist to `gameplay_events` via `record_gameplay_event`
- Speech split: `speechMediaRecorder`, `speechLiveRecognition`; `ListeningEncounter` uses `EncounterTargetRail`
- Quest/dungeon finish flows sync snapshot before guarded completion

## v0.6.5

- Architecture guardian fixes: split `questService` / `dungeonService`, `vocabularyBootstrap` in services layer
- `analyticsSystem` + event handlers wired for telemetry buffer
- Supabase migration 003: `apply_guarded_progression` RPC, `check_player_rate_limit` for speech
- Shared `EncounterTargetRail`, `useSpeechEncounterController`, `QuestContractActions`
- Docs/registry sync (v0.6.5 architecture, speech flow, GDD index); event-bus note in architecture-rules

## v0.6.4

- Mobile mic: invoke `getUserMedia` synchronously on tap (iOS permission prompt); `npm run dev:mobile` for HTTPS LAN testing
- LAN `http://192.168.x.x` shows explicit hint (browsers block mic without secure context)
- Speech and listening encounters aligned with `Panel`, `Button`, `Input`, and design tokens
- Mobile pass: 44px touch targets, stacked encounter actions, tighter Contract Board / prep gate padding
- `EncounterFocusShell`: fullscreen encounter mode on active contracts (reward + complete in overlay footer)

## v0.6.3

- UI foundation: design tokens, fonts (Barlow Condensed, DM Sans, Noto Sans JP), atmospheric entry screens
- Reusable components: `Button`, `Panel`, `Input`, `StatusChip`, `HunterShell`, `AtmosphericBackground`
- Contract Board shell (sticky HUD, penalty meters, animated XP/quest list); master prompt references ui-rules

## v0.6.2

- Vocabulary preparation UI: hunter briefing panel, readiness bar, target cards, deploy gate (encounter locked until briefing dismissed)
- Hydrate refreshes preparation data on existing quests; dismiss persists to quest snapshot
- Vocabulary preparation pipeline: extract targets → detect unknown → prioritize critical → mission briefing
- New systems under `/src/systems/vocabulary/` (detection, explanation, preparation, mastery tiers, quest vocabulary, orchestrator)
- `QuestPreparationBriefing` + `QuestPreparationGate` shown before quest encounters when unknown words exist
- Quest contract field `vocabularyPreparation`; event `VOCABULARY_PREPARATION_READY`
- Docs: `flows/vocabulary-preparation-flow.md`, `docs/vocabulary-philosophy.md`

## v0.6.1

- Speech architecture: centralized recording state machine (`IDLE` → `REQUESTING_PERMISSION` → `RECORDING` → `PROCESSING` → `COMPLETED` | `ERROR`)
- New systems: `microphoneSystem`, `speechProcessingSystem`, `clientTranscriptionSystem`, `silenceDetectionSystem`, `speechRecoverySystem`, `speechDebugSystem`
- MediaRecorder capture (`audio/webm`, Safari `audio/mp4` fallback) with stream cleanup via `track.stop()`
- Browser STT only — no OpenAI/Whisper, no server audio upload (`FEATURE_FLAGS.SPEECH_RECORDING`)
- `useSpeechRecording` hook; `SpeechEncounter` shows mic/recording/processing/transcription/failure states
- Contracts: `SpeechRecordingStatusContract` in `speech-contract.ts`

## v0.6.0

- Phase 5: dungeon system — Neon Corridor vertical slice with state machine, sectors, boss, extraction
- DUNGEON quest type with persisted `dungeonRun` (vocab → listening → NPC → speech → boss phases)
- Listening encounters (meaning-hint decode, no audio API)
- Dashboard dungeon panel: enter, deploy, sector flow, extract rewards
- Events: `ENCOUNTER_STARTED`, `ENCOUNTER_COMPLETED`, `DUNGEON_FAILED`

## v0.5.2

- Fix 403 on vocabulary load: stop client upsert to `vocabulary_entries` (RLS read-only); curated catalog stays in-memory
- App favicon via `src/app/icon.tsx`
- Fix romaji: kana→Hepburn conversion for JMDict readings and dialogue; remove fuzzy phrase matching that paired wrong readings
- Curated vocabulary stores kana readings (e.g. 火 → ひ / hi); UI shows kana + romaji; answers accept kana

## v0.5.1

- Mandatory Japanese + romaji everywhere: `JapaneseText`, `formatLearnerContent`, inline `日本語 (romaji)` in dialogue
- Director replies and stored messages embed romaji; quest repair backfills existing conversation threads

## v0.5.0

- Phase 4: speech system — pronunciation, hesitation, timing, confidence, composite scoring
- Web Speech API hook (`useBrowserSpeech`) + typed fallback; no paid Whisper/OpenAI
- Speech quests (`SPEECH` type) with phrase encounters from vocabulary catalog (level 3+)
- Anti-exploit: `speechGuard` rate limits transmissions per minute
- Events: `SPEECH_RECORDED`, `SPEECH_ANALYZED` handlers
- Dashboard `SpeechEncounter` UI integrated into quest cards

## v0.4.0

- Phase 3: JMDict vocabulary engine (XML parser, normalization, curated catalog, indexing, search, frequency picks)
- Per-player word mastery persisted in `word_mastery`; optional bulk ingest to `vocabulary_entries`
- Migration `002_jmdict_vocabulary.sql`; `npm run ingest:jmdict` for full dictionary XML
- Vocabulary encounters use frequency + mastery weighting (30 curated RPG terms)
- Event: `VOCABULARY_MASTERED`

## v0.3.0

- Phase 2: conversation quests with Director dialogue UI, intent/emotion scoring, memory persistence
- `conversationRepository` syncs threads to Supabase `conversations` table
- New quest type `CONVERSATION`; random quests alternate vocabulary / conversation
- Events: `MESSAGE_RECEIVED`, `AI_RESPONSE_GENERATED` handlers

## v0.2.0

- Phase 1 hardening: vocabulary encounter quests with real answer validation
- `penaltySystem`: quest failure / abandon applies corruption, fatigue, XP debt; fatigue reduces XP gains
- First-run tutorial quest auto-assigned on hydrate; briefing UI on dashboard
- Quest state persists encounter progress via `updateUserQuest` / `user_quests.progress`
- `PenaltyStatus` on dashboard; `QUEST_FAILED` and `PENALTY_TRIGGERED` event handlers

## v0.1.1

- Removed OpenAI/Whisper; free dialogue orchestrator + Web Speech API path
- Auth and env docs: Supabase only, no AI API keys
- Login: Supabase email/password, magic link, OAuth (Google), and anonymous guest on `/login`

## v0.1.0

- Sprint 0: Next.js 15 scaffold, folder migration (`/rules`, `/contracts`, `/flows`, `/prompts`, `/docs`, `/src`)
- Added `DECISIONS.md`, `docs/current-architecture.md`, `docs/supabase-setup.md`, `rules/system-rules.md`
- Phase 1: Auth (Google + guest), Supabase migration 001, progression/quest/save systems, player store, dashboard
- Phase 2–6 scaffolds: AI dialogue, JMDict parser stub, speech (browser STT), dungeons, multiplayer raids (feature flags off where required)
- Event bus extended with full `GAME_EVENTS` set and core handlers

## v0.0.1

- Initialized NOZOMI architecture
- Added contracts
- Added prompt systems
- Added architecture rules
- Added event system
- Added validation layer
