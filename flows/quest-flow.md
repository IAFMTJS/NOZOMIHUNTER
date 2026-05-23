# Quest Flow

Quest Generation
↓
Vocabulary preparation briefing (unknown / critical words)
↓
Difficulty Scaling
↓
Player Assignment
↓
Objective Tracking
↓
Encounter (vocabulary / conversation / speech — validate → mastery or resonance score)
↓
Progress Validation
↓
Completion Check (client `canCompleteQuest`)
↓
Persist quest snapshot (`updateUserQuest`)
↓
`complete_quest_guarded` RPC (validates non-hidden objectives on DB snapshot, caps XP, updates progression, grants inventory + credits, sets `pending_rewards`) → `applyActivityCompletion` syncs economy/inventory from DB (no double credit merge)
↓
`resolveRewardProgression` — merge reward `unlocks`, diff `newUnlocks`, emit `UNLOCK_GRANTED`
↓
Client sync store + tutorial unlocks (non-XP fields via `apply_guarded_progression`)
↓
`RewardClaimOverlay` → `clear_pending_rewards_guarded` (credits/items applied server-side; local `pendingRewards` cleared)
↓
Fatigue recovery (−1 on complete, cap 0) via `penaltyGameplaySystem`
↓
Save Progress (stats, penalties, remaining quests — XP already on server)
↓
Trigger Events

Optional (v1.0+ shell): `/contracts` → Track contract → `/prepare?questId=` → Deploy → `EncounterHost` hunt view

Events:
- QUEST_GENERATED
- QUEST_STARTED
- QUEST_COMPLETED
- QUEST_FAILED
- UNLOCK_GRANTED
- ENCOUNTER_ANSWER_CORRECT / ENCOUNTER_ANSWER_WRONG (vocabulary, conversation, speech, listening)

Presentation (v0.6.7): prep gate → auto-focus encounter shell; feedback flashes + audio on answer events.