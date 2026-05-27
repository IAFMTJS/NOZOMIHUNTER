export const VOCABULARY_PREPARATION_CONFIG = {
  MAX_BRIEFING_WORDS: 8,
  PREPARATION_PENALTY_PER_WORD: 8,
  /** Mastery below this counts as "unknown" for briefing highlights. */
  UNKNOWN_MASTERY_THRESHOLD: 20,
  /** Minimum mission vocabulary prep score before deploy checklist passes. */
  DEPLOY_MIN_PREPARATION_SCORE: 60,
} as const
