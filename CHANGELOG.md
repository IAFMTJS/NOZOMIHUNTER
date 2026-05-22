# Changelog

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
