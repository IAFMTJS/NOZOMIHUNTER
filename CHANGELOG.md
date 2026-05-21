# Changelog

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
