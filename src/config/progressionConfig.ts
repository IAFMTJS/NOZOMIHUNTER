export const PROGRESSION_CONFIG = {
  MAX_LEVEL: 100,
  BASE_XP: 100,
  LEVEL_MULTIPLIER: 1.25,
  RANK_THRESHOLDS: {
    E: 1,
    D: 10,
    C: 20,
    B: 35,
    A: 50,
    S: 75,
    SS: 90,
    SSS: 100,
  },
  MAX_XP_PER_QUEST_WINDOW_MS: 60_000,
  MAX_XP_PER_WINDOW: 500,
} as const
