export const HINT_CONFIG = {
  MAX_WHISPERS_PER_ENCOUNTER: 3,
  MAX_VISION_CHARGES_PER_ENCOUNTER: 8,
  /** Auto companion line after this many wrong answers on the current target. */
  AUTO_WHISPER_AFTER_WRONG: 2,
  /** Minimum hold duration (ms) before a vision charge is spent. */
  VISION_HOLD_MS: 400,
} as const
