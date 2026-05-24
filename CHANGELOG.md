# Changelog

## v1.2.2 (unreleased) — shop remediation + reference gap closure

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
