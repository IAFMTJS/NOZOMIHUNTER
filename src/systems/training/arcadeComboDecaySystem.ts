/** Combo decay pressure for training arcade modes (GDD differentiation). */

export const ARCADE_COMBO_DECAY_MS = 8000

export function comboDecayMultiplier(
  lastCorrectAtMs: number | undefined,
  nowMs: number = Date.now()
): number {
  if (lastCorrectAtMs == null) return 1
  const elapsed = nowMs - lastCorrectAtMs
  if (elapsed <= ARCADE_COMBO_DECAY_MS) return 1
  const steps = Math.floor((elapsed - ARCADE_COMBO_DECAY_MS) / 2000)
  return Math.max(0.25, 1 - steps * 0.15)
}

export function effectiveComboScore(streak: number, decay: number): number {
  return Math.round(streak * 100 * decay)
}
