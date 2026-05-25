# XP Flow

Quest Accepted
↓
Objective Progress
↓
Completion Validation
↓
Server reward calculation (`complete_quest_guarded` — fatigue multiplier, XP boost, reward amplifier, system breach)
↓
Penalty Check (fatigue applied server-side; rank shield may suppress failure debt)
↓
XP Gain (capped at 500 anti-exploit)
↓
Level Validation
↓
Rank Validation
↓
Unlock Validation
↓
Save Progress
↓
Trigger Events

Optional: **XP → Credits** (`convert_xp_to_credits_guarded`, max 3/day, inefficient tiers + 30% tax)

Events:
- QUEST_COMPLETED
- XP_GAINED
- XP_CONVERTED
- LEVEL_UP → `LevelUpCeremony` (store) + optional toast if ceremony skipped
- RANK_UP
- ACHIEVEMENT_UNLOCKED (presentation only; derived from player state)
- MASTERY_TIER_UP (vocabulary tier boundary)

Systems:
- questSystem
- progressionSystem
- rewardSystem (client preview via `previewCompletionRewards` only)
- penaltySystem
- xpConversionSystem
- saveSystem