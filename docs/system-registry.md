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

Responsibilities

* dungeon generation
* branching paths
* encounters
* raid support
* dungeon scaling

Dependencies

* progression system
* event bus
* encounter system

Events

* DUNGEON_ENTERED
* DUNGEON_COMPLETED
* DUNGEON_FAILED

Contracts

* dungeon-contract.ts

⸻

aiDialogueSystem

Responsibilities

* dialogue generation
* adaptive responses
* contextual immersion
* relationship responses

Dependencies

* memory system
* intent system
* emotion system

Events

* AI_RESPONSE_GENERATED

Contracts

* ai-contract.ts

⸻

speechSystem

Responsibilities

* speech analysis
* pronunciation scoring
* hesitation detection
* confidence scoring

Dependencies

* Whisper services
* progression system

Events

* SPEECH_ANALYZED

Contracts

* speech-contract.ts

⸻

penaltySystem

Responsibilities

* corruption
* fatigue
* XP debt
* punishment scaling

Dependencies

* progression system
* dungeon system

Events

* PENALTY_TRIGGERED

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