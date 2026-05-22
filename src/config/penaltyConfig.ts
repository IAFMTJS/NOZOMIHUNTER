import type { QuestPenaltyContract } from "@/contracts/quest-contract"

export const PENALTY_CONFIG = {
  DEFAULT_QUEST_FAILURE: {
    corruption: 1,
    fatigue: 1,
    xpDebt: 10,
  } satisfies QuestPenaltyContract,
  TUTORIAL_QUEST_FAILURE: {
    corruption: 0,
    fatigue: 1,
    xpDebt: 5,
  } satisfies QuestPenaltyContract,
  MAX_VOCAB_WRONG_ATTEMPTS: 5,
  MIN_WRONG_ATTEMPTS: 3,
  CORRUPTION_WRONG_ATTEMPT_STEP: 15,
  LISTENING_REPLAY_BASE: 3,
  MIN_LISTENING_REPLAYS: 1,
  CORRUPTION_REPLAY_STEP: 10,
  CORRUPTION_DUNGEON_FAILURE_THRESHOLD: 40,
  CORRUPTION_SIGNAL_DEGRADED: 25,
  FATIGUE_SIGNAL_DEGRADED: 40,
  FATIGUE_RECOVERY_ON_COMPLETE: 1,
  FATIGUE_XP_REDUCTION_PER_POINT: 0.02,
  MIN_XP_MULTIPLIER_FROM_FATIGUE: 0.5,
} as const
