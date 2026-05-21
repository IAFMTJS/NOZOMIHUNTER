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
  FATIGUE_XP_REDUCTION_PER_POINT: 0.02,
  MIN_XP_MULTIPLIER_FROM_FATIGUE: 0.5,
} as const
