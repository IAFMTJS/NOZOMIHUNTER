NOZOMI System Registry

progressionSystem

Responsibilities

* XP calculation
* leveling
* hunter ranks
* unlocks
* progression scaling

Dependencies

* player store
* event bus
* progression config

Events

* XP_GAINED
* LEVEL_UP
* RANK_UP
* UNLOCK_GRANTED

Contracts

* player-contract.ts

⸻

questSystem

Responsibilities

* quest generation
* quest validation
* quest rewards
* adaptive difficulty

Dependencies

* progression system
* event bus
* player stats

Events

* QUEST_ACCEPTED
* QUEST_COMPLETED
* QUEST_FAILED

Contracts

* quest-contract.ts

⸻

dungeonSystem

Location: `/src/systems/dungeons/*`, `/src/features/dungeons/*`

Responsibilities

* dungeon generation (`dungeonGenerator`, `dungeonQuestGenerator`)
* state machine (`dungeonStateMachine`, `dungeonOrchestrator`)
* sector + boss encounter mounting (`dungeonEncounterFactory`)
* listening encounters (`listeningEncounterSystem`)
* access gates (`dungeonAccess`)
* persistence via DUNGEON quest snapshots

Dependencies

* vocabulary, conversation, speech encounter systems
* progression system (rewards on extraction)
* penalty system (failure / abort)
* event bus

Events

* DUNGEON_ENTERED
* ENCOUNTER_STARTED
* ENCOUNTER_COMPLETED
* DUNGEON_COMPLETED
* DUNGEON_FAILED

Contracts

* dungeon-contract.ts
* encounter-contract.ts (ListeningEncounterContract)

⸻

aiDialogueSystem

Location: `/src/systems/ai/dialogueOrchestrator.ts`

Responsibilities

* dialogue generation (rule-based, no paid APIs)
* intent + emotion driven responses
* scenario-aware director replies
* conversation scoring

Dependencies

* memory system
* intent system
* emotion system
* conversation content config

Events

* MESSAGE_RECEIVED
* AI_RESPONSE_GENERATED

Contracts

* ai-contract.ts
* encounter-contract.ts

⸻

conversationEncounterSystem

Location: `/src/systems/quests/conversationEncounterSystem.ts`

Responsibilities

* conversation quest threads
* exchange validation
* memory updates per message
* quest objective progression

Dependencies

* dialogue orchestrator
* conversation scoring
* conversation repository

⸻

speechSystem

Location: `/src/systems/speech/*`, `/src/services/speech/transcribe.ts`, `/src/hooks/useSpeechRecording.ts`

Responsibilities

* **recordingStateSystem** — strict IDLE → REQUESTING_PERMISSION → RECORDING → PROCESSING → COMPLETED | ERROR
* **microphoneSystem** — `beginMicrophoneRequest` (gesture-safe), stream cleanup, level monitor
* **speechContextSystem** — secure-context / LAN HTTP diagnostics for mobile
* **speechProcessingSystem** — MediaRecorder + live browser STT orchestration
* **clientTranscriptionSystem** — browser STT transcript resolution (no server upload)
* **silenceDetectionSystem** — auto-stop on sustained silence
* **speechRecoverySystem** — stale session / page-hide recovery
* **speechDebugSystem** — optional `NEXT_PUBLIC_SPEECH_DEBUG` tracing
* speech analysis pipeline (pronunciation, hesitation, timing, confidence, composite)
* speech encounter quest progression
* anti-exploit: client `speechGuard` + server `check_player_rate_limit` RPC

Dependencies

* Browser MediaRecorder + Web Speech API (live transcript) or typed transcript
* No paid STT / Whisper / OpenAI APIs — typed fallback when browser STT unavailable
* vocabulary catalog (phrase picks)
* progression system (via quest completion)
* event bus

Events

* SPEECH_RECORDED
* SPEECH_ANALYZED

Contracts

* speech-contract.ts
* encounter-contract.ts (SpeechEncounterContract)

⸻

speechEncounterSystem

Location: `/src/systems/quests/speechEncounterSystem.ts`

Responsibilities

* speech quest phrase selection
* apply analysis to quest objectives
* wrong-attempt failure threshold

Dependencies

* speech pipeline, quest validator, vocabulary word picker

⸻

penaltySystem

Location: `/src/systems/penalties/penaltySystem.ts`

Responsibilities

* corruption
* fatigue
* XP debt
* punishment scaling on quest failure
* fatigue XP reduction multiplier

Dependencies

* progression system
* event bus
* penalty config

Events

* PENALTY_TRIGGERED

⸻

presentationSystem

Location: `/src/systems/presentation/penaltyPresentationSystem.ts`, `/src/app/globals.css` (atmosphere + penalty classes)

Responsibilities

* map `PlayerPenaltyContract` to shell/encounter CSS classes (corruption scanlines, fatigue transition speed)
* shared motion tokens (`/src/config/motionPresets.ts`)

Dependencies

* player-contract penalties

UI consumers

* `HunterShell`, `EncounterFocusShell`, `PenaltyStatus`, `XPBar`

⸻

audioSystem

Location: `/src/systems/audio/*`

Responsibilities

* Web Audio UI cues (confirm, error, level up, sector clear, corruption hum)
* mute preference (`localStorage`)
* subscribe via `registerAudioHandlers` on core event bus

Events (played)

* `ENCOUNTER_ANSWER_CORRECT`, `ENCOUNTER_ANSWER_WRONG`, `LEVEL_UP`, `QUEST_COMPLETED`, `ENCOUNTER_STARTED`, `ENCOUNTER_COMPLETED`, `DUNGEON_*`, `PENALTY_TRIGGERED`

Emitted by encounter systems on answer/score outcomes.

⸻

vocabularyPreparationSystem

Location: `/src/systems/vocabulary/*`, `/src/components/preparation/QuestPreparationBriefing.tsx`

Responsibilities

* extract quest vocabulary targets (`questVocabularySystem`, `collectQuestVocabularyTargets`)
* detect unknown words vs player mastery tiers (`vocabularyDetectionSystem`, `vocabularyMasteryBridge`)
* prioritize critical vocabulary (`vocabularyPrioritySystem`)
* generate mission briefing (`vocabularyExplanationSystem`, `vocabularyPreparationSystem`, `vocabularyPreparationOrchestrator`)
* pre-quest UI gate (`QuestPreparationGate`)

Dependencies

* vocabulary catalog, masterySystem (numeric 0–100)
* quest generator / accept / repair (attach `vocabularyPreparation` on quest)

Events

* `VOCABULARY_PREPARATION_READY`

Contracts

* `vocabulary-contract.ts` (`QuestVocabularyPreparationContract`)
* `quest-contract.ts` (`vocabularyPreparation` field)

Philosophy: `/docs/vocabulary-philosophy.md` · Flow: `/flows/vocabulary-preparation-flow.md`

⸻

vocabularyEncounterSystem

Location: `/src/systems/quests/vocabularyEncounterSystem.ts`

Responsibilities

* frequency-weighted word selection from vocabulary catalog
* answer validation (romaji / English)
* encounter progress sync with quest objectives
* mastery deltas per answer

Dependencies

* vocabularyCatalog, frequencySystem, masterySystem
* quest validator

Contracts

* encounter-contract.ts
* vocabulary-contract.ts
* quest-contract.ts (vocabularyEncounter field)

⸻

jmdictParser

Location: `/src/services/jmdict/parser.ts`

Responsibilities

* parse JMDict XML to normalized entries
* priority tag → frequency tier

Dependencies

* jmdictConfig, normalize

⸻

vocabularyCatalog

Location: `/src/systems/mastery/vocabularyCatalog.ts`

Responsibilities

* in-memory vocabulary index (curated + DB merge)
* catalog init on player hydrate

Dependencies

* jmdictCurated, vocabularyIndex

⸻

masterySystem

Location: `/src/systems/mastery/masterySystem.ts`

Responsibilities

* per-word mastery 0–100
* correct/wrong tracking
* VOCABULARY_MASTERED event at 80+

Dependencies

* vocabularyRepository (persist via quest service)
* event bus

Events

* VOCABULARY_MASTERED

Contracts

* vocabulary-contract.ts

⸻

searchSystem / frequencySystem

Location: `/src/systems/mastery/searchSystem.ts`, `frequencySystem.ts`

Responsibilities

* fast in-memory search
* encounter word picking (frequency + low mastery bias)

⸻

tutorialSystem

Location: `/src/systems/tutorial/tutorialSystem.ts`

Responsibilities

* first-run tutorial quest assignment
* tutorial unlock flag (`system:tutorial:intro`)
* briefing copy

Dependencies

* quest generator
* player progression unlocks

⸻

eventBus

Responsibilities

* event distribution
* decoupled communication
* orchestration

Dependencies

* event handlers
* event registry

Events

* all gameplay events

⸻

analyticsSystem

Location: `/src/systems/analytics/analyticsSystem.ts`

Responsibilities

* in-memory telemetry buffer (`recordAnalyticsEvent`)
* persists via `record_gameplay_event` RPC → `gameplay_events` table
* fed by `registerCoreEventHandlers` alongside structured logging

Dependencies

* event bus (subscribe via eventHandlers)
* logger

Events

* all major gameplay events (read-only consumers)

⸻

saveSystem

Responsibilities

* autosave
* recovery
* checkpoints
* rollback safety

Dependencies

* Supabase services
* stores

Events

* SAVE_TRIGGERED
* AUTOSAVE_COMPLETED

⸻

antiExploitSystem

Responsibilities

* XP exploit detection
* speech spam prevention
* repeated loop detection
* macro behavior analysis

Dependencies

* progression system
* analytics system

Events

* EXPLOIT_DETECTED

⸻

resolveQuestCompletion (v0.7.0)

Responsibilities

* merge reward unlocks into progression on quest/dungeon complete
* diff new unlock keys; emit UNLOCK_GRANTED

Dependencies

* unlockSystem
* event bus

⸻

penaltyGameplaySystem (v0.7.1)

Responsibilities

* corruption-modified wrong-attempt limits, listening replays, dungeon failure budget
* fatigue recovery on completion

Dependencies

* penaltyConfig
* dungeonConfig

⸻

unlockRegistry (config)

Responsibilities

* human labels for system:/dungeon:/title: unlock keys

⸻

themedAudioSystem (v0.8.0)

Responsibilities

* optional MP3 cues per dungeon theme; procedural fallback

Dependencies

* audioSystem

⸻

dungeonAccess (extended v0.7.0)

Responsibilities

* listAllDungeonDefinitions
* resolveDungeonAccess (available, locked_level, locked_prerequisite, blocked_active_run)

Events

* UNLOCK_GRANTED (progression)

⸻

hunterIdentitySystem (v0.9.0)

Location: `/src/systems/identity/hunterIdentitySystem.ts`

Responsibilities

* derive and resolve hunter codename + registry ID (HN-####)
* backfill on hydrate when DB columns empty

Dependencies

* `hunterCodenames` config

Contracts

* `player-contract.ts` (`HunterIdentityContract`)

⸻

synchronizationSystem (v0.9.0)

Location: `/src/systems/synchronization/synchronizationSystem.ts`

Responsibilities

* discipline chain status (STABLE / AT_RISK / BROKEN / DORMANT)
* advance chain on contract/dungeon completion via `playerActivitySystem`
* milestone title unlocks (`title:discipline-*`)

Events

* `SYNC_MAINTAINED`, `SYNC_DECAY_WARNING` (types registered; analytics optional)

⸻

readinessSystem (v0.9.0)

Location: `/src/systems/readiness/readinessSystem.ts`

Responsibilities

* operational readiness score + survival band
* factors for corruption, fatigue, XP debt, listening, mission type

Consumers

* `ContractHub` menu, `HunterProfilePanel`, `vocabularyPreparationOrchestrator` (when player known)
* `/prepare` (`PreparationRingGauge`, survival band)
* `preparationChecklistSystem` (checklist facet of readiness UI)

Contracts

* `readiness-contract.ts`

⸻

dungeonForecastSystem (v0.9.0)

Location: `/src/systems/dungeons/dungeonForecastSystem.ts`

Responsibilities

* next locked/available gate preview
* danger tier + readiness advisory

Dependencies

* `dungeonAccess`, `readinessSystem`, `dungeonConfig`

⸻

vocabularyThreatSystem (v0.9.0)

Location: `/src/systems/vocabulary/vocabularyThreatSystem.ts`

Responsibilities

* map catalog + quest context → threat tier (ROUTINE → SECTOR_CRITICAL)
* display labels for briefing UI

Dependencies

* `vocabularyCatalog`, `vocabularyExplanationSystem`

⸻

systemMessagingSystem (v0.9.0)

Location: `/src/systems/messaging/systemMessagingSystem.ts`

Responsibilities

* contextual system lines from pools (`systemMessages` config)
* daily rotation via player id + date seed

UI

* `SystemMessageRail` (hunter status menu, profile dossier)

⸻

hunterPresentationSystem (v0.9.0)

Location: `/src/systems/presentation/hunterPresentationSystem.ts`

Responsibilities

* rank aura, corruption portrait, sync-at-risk, readiness shell classes
* extends penalty presentation for `HunterShell` / portrait slot

⸻

playerActivitySystem (v0.9.0)

Location: `/src/systems/player/playerActivitySystem.ts`

Responsibilities

* record synchronization activity on quest/dungeon complete
* emit discipline title unlocks

⸻

dungeonSectorMapSystem (v0.9.1)

Location: `/src/systems/dungeons/dungeonSectorMapSystem.ts`

Responsibilities

* vertical breach map nodes (depth, danger, next gate)
* `resolveDungeonDeployAdvisory` for readiness warnings

UI

* `SectorMapRail`

⸻

vocabularyThreatMetadata (config, v0.9.1)

Location: `/src/config/vocabularyThreatMetadata.ts`

Responsibilities

* boss-critical and per-dungeon sector-critical word id sets

⸻

economyLayer (v1.0.0)

Location: `/src/systems/economy/staminaSystem.ts`, `/src/services/supabase/economyRepository.ts`, migration `006_economy_inventory.sql`

Responsibilities

* player economy fields: credits, stamina, staminaMax, brewTokens
* guarded RPCs: `spend_stamina_guarded`, `brew_word_guarded`, `clear_pending_rewards_guarded`
* `grant_inventory_items` on quest completion (via extended `complete_quest_guarded`)
* `seed_starter_inventory` on first hydrate

Dependencies

* `player-contract.ts` (`PlayerEconomyContract`)
* `economy-contract.ts`

Contracts

* `economy-contract.ts`
* `player-contract.ts` (`economy`, `pendingRewards`, `inventory`)

⸻

inventorySystem (v1.0.0)

Location: `/src/systems/inventory/inventorySystem.ts`, `/src/services/supabase/inventoryRepository.ts`

Responsibilities

* capacity, equipped count, consumable/equipment readiness checks
* merge grants into local inventory slots
* load inventory on hydrate / post-completion

Dependencies

* `inventoryConfig`, `item_catalog` table

Contracts

* `economy-contract.ts` (`InventorySlotContract`, `ItemCatalogEntryContract`)

UI

* `/inventory` grid

⸻

staminaSystem (v1.0.0)

Location: `/src/systems/economy/staminaSystem.ts`

Responsibilities

* `canSpendStamina`, `staminaAfterSpend`, `defaultEconomy`
* dungeon enter cost from `staminaConfig`

Consumers

* `/dungeons/[key]` enter flow → `spend_stamina_guarded`

⸻

brewSystem (v1.0.0)

Location: `/src/systems/vocabulary/brewSystem.ts`

Responsibilities

* brew token eligibility, random unknown-word candidate from curated catalog
* local token decrement after `brew_word_guarded` (updates `word_mastery` only)

Dependencies

* `brewConfig`, JMDICT curated pool

UI

* `/vocabulary` Brew action

⸻

hunterPowerSystem (v1.0.0)

Location: `/src/systems/power/hunterPowerSystem.ts`

Responsibilities

* compute attack/defense/crit from stats, level, equipped gear
* `recommendedPowerForDungeon` for sector advisory on dungeon detail

Consumers

* `/stats`, dungeon detail deploy warning, `PowerComparison` on `/prepare`

⸻

missionCatalogSystem (v1.0.0)

Location: `/src/systems/quests/missionCatalogSystem.ts`

Responsibilities

* partition active quests into main story / side / completed views
* infer `narrativeTier` (MAIN | SIDE)
* objective display text with hidden objectives

Consumers

* `/missions`, `/missions/[id]`

Contracts

* `quest-contract.ts` (`QuestNarrativeTier`)

⸻

missionTrackingSystem (v1.0.0)

Location: `/src/systems/quests/missionTrackingSystem.ts`

Responsibilities

* `trackedQuestId` on player; resolve tracked quest from board
* persist via `profiles.tracked_quest_id` + `updateTrackedQuestRow`

Consumers

* mission detail “Track” action, home hub highlight

⸻

rewardClaimSystem (v1.0.0)

Location: `/src/systems/rewards/rewardClaimSystem.ts`

Responsibilities

* parse / stage / clear `pendingRewards` bundle (XP, credits, items)
* overlay claim flow after guarded completion

Dependencies

* `complete_quest_guarded` writes `progression.pending_rewards`
* `clear_pending_rewards_guarded` RPC

UI

* `RewardClaimOverlay` in `HunterSessionProvider`

Contracts

* `economy-contract.ts` (`PendingRewardBundleContract`)

⸻

preparationChecklistSystem (v1.0.0)

Location: `/src/systems/readiness/preparationChecklistSystem.ts`

Responsibilities

* equipment, skill loadout, consumables, vocabulary checklist booleans
* `checklistComplete` gate for deploy advisory

Dependencies

* `inventorySystem`, player stats, vocabulary prep readiness

Contracts

* `readiness-contract.ts` (`PreparationChecklistContract`)

UI

* `/prepare` (`PreparationChecklist`, `PreparationRingGauge`)

⸻

shopSystem (v1.1.0)

Location: `/src/systems/economy/shopSystem.ts`

Responsibilities

* shop listings from catalog `credit_price`
* `canPurchase`, `purchaseQuote`

Dependencies

* `inventorySystem` capacity checks

RPC

* `purchase_item_guarded`

UI

* `/inventory` Shop tab

Contracts

* `economy-contract.ts` (`ShopListingContract`)

⸻

achievementSystem (v1.1.0)

Location: `/src/systems/progression/achievementSystem.ts`

Responsibilities

* derive unlocked achievements from progression, sync, dungeons, titles

UI

* `/achievements`

⸻

hunterSessionLayer (v1.0.0, app — not gameplay logic)

Location: `/src/features/hunter/context/HunterSessionContext.tsx`

Responsibilities

* single hydrate: player, quests, event handlers, audio unlock
* shell: `HunterShellLayout` + page children + `EncounterHost` + progression notices
* `trackMission`, `claimRewards`, `hubView` for ContractHub overlays

Dependencies

* player store, quest/dungeon hooks, economy repository