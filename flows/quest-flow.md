# Quest Flow

Quest Generation (`requestNewQuest(channel)` — `daily` | `side` | `story`)
↓
Daily channel → `dailyQuestSystem` (deterministic id per UTC date, `DAILY` tier)
Side channel → vocabulary or conversation (`SIDE` tier, SIDE rewards)
Story / default → `generateQuestForPlayer` (MAIN-tier mix)
Training → `/training` → `trainingMissionSystem` (hidden, not in catalog)
↓
Vocabulary preparation briefing (unknown / critical words)
↓
Difficulty Scaling
↓
Player Assignment
↓
Objective Tracking
↓
Encounter (vocabulary / conversation / speech / listening — validate → mastery or resonance score)
Listening: must play audio (`heardOnce`) before submit; skip token cannot bypass listening
↓
Progress Validation
↓
Completion Check (client `canCompleteQuest`)
↓
Persist quest snapshot (`updateUserQuest`)
↓
`complete_quest_guarded` RPC (validates non-hidden objectives, applies server-side fatigue + completion boosts, grants XP/credits/inventory, consumes use-based boosts, sets `pending_rewards`) → `applyActivityCompletion` syncs economy/inventory/active_boosts from DB
↓
`resolveRewardProgression` — merge reward `unlocks`, diff `newUnlocks`, emit `UNLOCK_GRANTED`
↓
Client sync store + tutorial unlocks (non-XP fields via `apply_guarded_progression`)
↓
`RewardClaimOverlay` → `clear_pending_rewards_guarded` (credits/items applied server-side; local `pendingRewards` cleared)
↓
Fatigue recovery (−1 on complete, cap 0) via `penaltyGameplaySystem`
↓
Save Progress (stats via `playerStatProgressionSystem`, penalties, remaining quests — XP already on server)
↓
Trigger Events

Quest Channel (v1.2.3+): `/contracts?tab=daily|side|story` → request from ops strip (channel-aware) → `/contracts/[id]` → **Enter** → `/prepare?questId=` → Deploy → `EncounterHost` → claim → `/vocabulary?session=last`
Corrupted encounter: `questPlayabilitySystem` → "MISSION DATA CORRUPTED" on card + contract detail

Optional track: secondary **Track on home** on contract file (tracked card on `/home`).

Events:
- QUEST_GENERATED
- QUEST_STARTED
- QUEST_COMPLETED
- QUEST_FAILED
- UNLOCK_GRANTED
- ENCOUNTER_ANSWER_CORRECT / ENCOUNTER_ANSWER_WRONG (vocabulary, conversation, speech, listening)

Optional shop hooks (v1.2.2):
- **Skip token** — `shopEffectActions.skipQuestObjective` (not on boss encounters)
- **Quest retry** — Active Enhancements rail retries most recent failed contract
- **Rank shield** — suppresses XP debt on failure (interim until rank-loss mechanics)

Presentation (v0.6.7): prep gate → auto-focus encounter shell; feedback flashes + audio on answer events.