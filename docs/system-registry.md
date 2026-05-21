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

Location: `/src/systems/speech/*`, `/src/services/speech/transcribe.ts`

Responsibilities

* speech analysis pipeline (pronunciation, hesitation, timing, confidence, composite)
* speech encounter quest progression
* anti-exploit rate limiting (`speechGuard`)

Dependencies

* Web Speech API (client hook) or typed transcript
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

Responsibilities

* gameplay telemetry
* balancing analytics
* failure tracking
* progression analytics

Dependencies

* event bus

Events

* all major gameplay events

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