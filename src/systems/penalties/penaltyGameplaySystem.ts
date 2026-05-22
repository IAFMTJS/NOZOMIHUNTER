import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { PENALTY_CONFIG } from "@/config/penaltyConfig"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"

export function maxWrongAttemptsForPenalties(
  penalties: PlayerPenaltyContract
): number {
  const base = PENALTY_CONFIG.MAX_VOCAB_WRONG_ATTEMPTS
  const reduction = Math.floor(penalties.corruption / PENALTY_CONFIG.CORRUPTION_WRONG_ATTEMPT_STEP)
  return Math.max(
    PENALTY_CONFIG.MIN_WRONG_ATTEMPTS,
    base - reduction
  )
}

export function listeningReplayLimitForPenalties(
  penalties: PlayerPenaltyContract
): number {
  const base = PENALTY_CONFIG.LISTENING_REPLAY_BASE
  const reduction = Math.floor(
    penalties.corruption / PENALTY_CONFIG.CORRUPTION_REPLAY_STEP
  )
  return Math.max(PENALTY_CONFIG.MIN_LISTENING_REPLAYS, base - reduction)
}

export function maxDungeonEncounterFailures(
  penalties: PlayerPenaltyContract
): number {
  if (penalties.corruption >= PENALTY_CONFIG.CORRUPTION_DUNGEON_FAILURE_THRESHOLD) {
    return Math.max(1, DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES - 1)
  }
  return DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES
}

export function applyFatigueRecoveryOnComplete(
  penalties: PlayerPenaltyContract
): PlayerPenaltyContract {
  if (penalties.fatigue <= 0) return penalties
  return {
    ...penalties,
    fatigue: Math.max(0, penalties.fatigue - PENALTY_CONFIG.FATIGUE_RECOVERY_ON_COMPLETE),
  }
}

export function hasSignalDegradation(penalties: PlayerPenaltyContract): boolean {
  return (
    penalties.corruption >= PENALTY_CONFIG.CORRUPTION_SIGNAL_DEGRADED ||
    penalties.fatigue >= PENALTY_CONFIG.FATIGUE_SIGNAL_DEGRADED
  )
}
