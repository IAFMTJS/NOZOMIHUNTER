import type { DungeonRunContract, DungeonThreatState } from "@/contracts/dungeon-contract"
import { DUNGEON_CONSEQUENCE_COPY } from "@/contracts/presentation-contract"
import type { DungeonModifierContract } from "@/contracts/game-mode-contract"
import { combinedCorruptionMutation } from "./dungeonModifierSystem"

export const THREAT_LIMITS = {
  corruption: 100,
  bossAwareness: 100,
  signalStability: 100,
  hunterFocus: 100,
} as const

export const BOSS_AWARENESS_THRESHOLDS = {
  whisper: 25,
  interrupt: 50,
  miniBoss: 75,
  forced: 100,
} as const

export function initThreatState(
  modifier?: DungeonModifierContract
): DungeonThreatState {
  const baseAwareness = modifier?.huntersMark ? 15 : 0
  return {
    corruptionPressure: combinedCorruptionMutation(modifier ? [modifier] : undefined),
    bossAwareness: baseAwareness,
    signalStability: 100,
    hunterFocus: 0,
  }
}

function clampThreat(state: DungeonThreatState): DungeonThreatState {
  return {
    corruptionPressure: Math.min(
      THREAT_LIMITS.corruption,
      Math.max(0, state.corruptionPressure)
    ),
    bossAwareness: Math.min(
      THREAT_LIMITS.bossAwareness,
      Math.max(0, state.bossAwareness)
    ),
    signalStability: Math.min(
      THREAT_LIMITS.signalStability,
      Math.max(0, state.signalStability)
    ),
    hunterFocus: Math.min(THREAT_LIMITS.hunterFocus, Math.max(0, state.hunterFocus)),
  }
}

function corruptionMultiplier(modifier?: DungeonModifierContract): number {
  return modifier?.corruptionGainMultiplier ?? 1
}

export function applyCorrectConsequence(
  run: DungeonRunContract,
  streak: number
): { run: DungeonRunContract; line: string } {
  const threat = run.threat ?? initThreatState(run.activeModifier)
  let next: DungeonThreatState = {
    ...threat,
    corruptionPressure: Math.max(0, threat.corruptionPressure - 4),
    hunterFocus: Math.min(THREAT_LIMITS.hunterFocus, threat.hunterFocus + 6),
  }
  if (streak >= 3) {
    next = {
      ...next,
      corruptionPressure: Math.max(0, next.corruptionPressure - 2),
      hunterFocus: Math.min(THREAT_LIMITS.hunterFocus, next.hunterFocus + 4),
    }
  }
  return {
    run: {
      ...run,
      threat: clampThreat(next),
      lastConsequenceLine: DUNGEON_CONSEQUENCE_COPY.correct,
    },
    line: DUNGEON_CONSEQUENCE_COPY.correct,
  }
}

export function applyWrongConsequence(
  run: DungeonRunContract
): { run: DungeonRunContract; line: string; forceBoss: boolean } {
  const threat = run.threat ?? initThreatState(run.activeModifier)
  const mult = corruptionMultiplier(run.activeModifier)
  const next = clampThreat({
    ...threat,
    corruptionPressure: threat.corruptionPressure + Math.round(8 * mult),
    bossAwareness: threat.bossAwareness + 10,
    signalStability: Math.max(0, threat.signalStability - 6),
    hunterFocus: Math.max(0, threat.hunterFocus - 3),
  })
  const forceBoss =
    next.bossAwareness >= BOSS_AWARENESS_THRESHOLDS.forced &&
    run.machineState !== "BOSS"
  return {
    run: {
      ...run,
      threat: next,
      lastConsequenceLine: DUNGEON_CONSEQUENCE_COPY.wrong,
    },
    line: DUNGEON_CONSEQUENCE_COPY.wrong,
    forceBoss,
  }
}

export function applyFocusCost(run: DungeonRunContract): DungeonRunContract {
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: clampThreat({
      ...threat,
      corruptionPressure: threat.corruptionPressure + 5,
      hunterFocus: Math.min(THREAT_LIMITS.hunterFocus, threat.hunterFocus + 8),
    }),
    lastConsequenceLine: DUNGEON_CONSEQUENCE_COPY.focus,
  }
}

export function applyGreedyRoute(run: DungeonRunContract): DungeonRunContract {
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: clampThreat({
      ...threat,
      bossAwareness: threat.bossAwareness + 8,
      corruptionPressure: threat.corruptionPressure + 3,
    }),
    lastConsequenceLine: DUNGEON_CONSEQUENCE_COPY.routeGreedy,
  }
}

export function applyListeningReplayPenalty(
  run: DungeonRunContract
): DungeonRunContract {
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: clampThreat({
      ...threat,
      signalStability: Math.max(0, threat.signalStability - 10),
      corruptionPressure: threat.corruptionPressure + 2,
    }),
  }
}

export function bossAwarenessWhisperLine(
  awareness: number
): string | null {
  if (awareness >= BOSS_AWARENESS_THRESHOLDS.forced) {
    return DUNGEON_CONSEQUENCE_COPY.bossWhisper100
  }
  if (awareness >= BOSS_AWARENESS_THRESHOLDS.miniBoss) {
    return DUNGEON_CONSEQUENCE_COPY.bossWhisper75
  }
  if (awareness >= BOSS_AWARENESS_THRESHOLDS.interrupt) {
    return DUNGEON_CONSEQUENCE_COPY.bossWhisper50
  }
  if (awareness >= BOSS_AWARENESS_THRESHOLDS.whisper) {
    return DUNGEON_CONSEQUENCE_COPY.bossWhisper25
  }
  return null
}

export function shouldForceBossFromAwareness(run: DungeonRunContract): boolean {
  return (
    (run.threat?.bossAwareness ?? 0) >= BOSS_AWARENESS_THRESHOLDS.miniBoss &&
    run.machineState !== "BOSS" &&
    run.machineState !== "EXTRACTION"
  )
}

export function bumpRunScore(run: DungeonRunContract, delta: number): DungeonRunContract {
  return { ...run, runScore: (run.runScore ?? 0) + delta }
}
