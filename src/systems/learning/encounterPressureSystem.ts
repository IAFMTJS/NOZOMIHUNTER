export interface EncounterPressureState {
  correctStreak: number
  wrongAttempts: number
}

export function initPressureState(): EncounterPressureState {
  return { correctStreak: 0, wrongAttempts: 0 }
}

export function afterCorrectAnswer(
  state: EncounterPressureState
): EncounterPressureState {
  return {
    correctStreak: state.correctStreak + 1,
    wrongAttempts: state.wrongAttempts,
  }
}

export function afterWrongAnswer(
  state: EncounterPressureState
): EncounterPressureState {
  return {
    correctStreak: 0,
    wrongAttempts: state.wrongAttempts + 1,
  }
}

export function pressureFeedbackLine(state: EncounterPressureState): string | null {
  if (state.correctStreak >= 3) {
    return "Channel stabilized. XP multiplier increased."
  }
  if (state.wrongAttempts >= 2) {
    return "Signal corruption rising…"
  }
  return null
}

export function replayDegradationLine(replayCount: number, maxReplays: number): string | null {
  if (replayCount <= 1) return null
  if (replayCount >= maxReplays) {
    return "Signal critically degraded — last replay."
  }
  return "Signal degrading…"
}

export function xpMultiplierFromStreak(streak: number): number {
  if (streak >= 5) return 1.25
  if (streak >= 3) return 1.1
  return 1
}

/** Milestone streak counts that trigger combo feedback. */
export const COMBO_MILESTONES = [3, 5, 10] as const

export function isComboMilestone(streak: number): boolean {
  return (COMBO_MILESTONES as readonly number[]).includes(streak)
}

export function peakEncounterStreak(quest: {
  vocabularyEncounter?: { correctStreak?: number } | null
  listeningEncounter?: { correctStreak?: number } | null
  dungeonRun?: { peakEncounterStreak?: number } | null
}): number {
  const live = Math.max(
    quest.vocabularyEncounter?.correctStreak ?? 0,
    quest.listeningEncounter?.correctStreak ?? 0
  )
  return Math.max(live, quest.dungeonRun?.peakEncounterStreak ?? 0)
}

export function nextPeakEncounterStreak(
  currentPeak: number | undefined,
  quest: {
    vocabularyEncounter?: { correctStreak?: number } | null
    listeningEncounter?: { correctStreak?: number } | null
  }
): number {
  return Math.max(currentPeak ?? 0, peakEncounterStreak(quest))
}
