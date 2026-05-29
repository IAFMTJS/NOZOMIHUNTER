/** Shared motion timing — matches ui-rules (subtle, deliberate). */
export const GAME_EASE = [0.22, 1, 0.36, 1] as const

export const MOTION = {
  feedback: { duration: 0.2, ease: GAME_EASE },
  panel: { duration: 0.3, ease: GAME_EASE },
  atmosphere: { duration: 0.6, ease: GAME_EASE },
  listItem: { duration: 0.3, ease: GAME_EASE },
  /** Screen mental states (visual-direction-v2) */
  landing: { duration: 0.8, ease: GAME_EASE },
  command: { duration: 0.35, ease: GAME_EASE },
  deployment: { duration: 0.4, ease: GAME_EASE },
  dungeonTension: { duration: 0.25, ease: GAME_EASE },
  extraction: { duration: 0.5, ease: GAME_EASE },
} as const
