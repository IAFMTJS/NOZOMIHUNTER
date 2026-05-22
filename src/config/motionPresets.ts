/** Shared motion timing — matches ui-rules (subtle, deliberate). */
export const GAME_EASE = [0.22, 1, 0.36, 1] as const

export const MOTION = {
  feedback: { duration: 0.2, ease: GAME_EASE },
  panel: { duration: 0.3, ease: GAME_EASE },
  atmosphere: { duration: 0.6, ease: GAME_EASE },
  listItem: { duration: 0.3, ease: GAME_EASE },
} as const
