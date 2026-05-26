import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type {
  ReadinessFactorContract,
  ReadinessResultContract,
  SurvivalBand,
} from "@/contracts/readiness-contract"
import { READINESS_CONFIG } from "@/config/readinessConfig"

export interface ReadinessInput {
  player: PlayerContract
  vocabularyScore?: number
  quest?: Pick<QuestContract, "type">
}

export function isReadinessHardBlocked(
  readiness: ReadinessResultContract,
  options?: { allowCritical?: boolean }
): boolean {
  if (options?.allowCritical) return false
  return readiness.survivalBand === "CRITICAL"
}

function survivalBand(score: number): SurvivalBand {
  const t = READINESS_CONFIG.SURVIVAL_THRESHOLDS
  if (score < t.CRITICAL) return "CRITICAL"
  if (score < t.UNSTABLE) return "UNSTABLE"
  if (score < t.STABLE) return "STABLE"
  return "OPTIMAL"
}

function survivalLabel(band: SurvivalBand): string {
  switch (band) {
    case "CRITICAL":
      return "Survival efficiency: critical"
    case "UNSTABLE":
      return "Survival efficiency: unstable"
    case "STABLE":
      return "Survival efficiency: stable"
    case "OPTIMAL":
      return "Survival efficiency: optimal"
  }
}

export function computeReadiness(input: ReadinessInput): ReadinessResultContract {
  const { player } = input
  const factors: ReadinessFactorContract[] = []
  let score = input.vocabularyScore ?? 100

  if (input.vocabularyScore != null) {
    factors.push({
      id: "vocab",
      label: "Vocabulary familiarity",
      impact: input.vocabularyScore - 100,
    })
  }

  const corruptionPenalty =
    player.penalties.corruption *
    READINESS_CONFIG.CORRUPTION_PENALTY_PER_POINT
  if (corruptionPenalty > 0) {
    score -= corruptionPenalty
    factors.push({
      id: "corruption",
      label: "Corruption load",
      impact: -corruptionPenalty,
    })
  }

  const fatiguePenalty =
    player.penalties.fatigue * READINESS_CONFIG.FATIGUE_PENALTY_PER_POINT
  if (fatiguePenalty > 0) {
    score -= fatiguePenalty
    factors.push({
      id: "fatigue",
      label: "Fatigue degradation",
      impact: -fatiguePenalty,
    })
  }

  const debtPenalty = Math.min(
    READINESS_CONFIG.XP_DEBT_PENALTY_CAP,
    player.penalties.xpDebt / READINESS_CONFIG.XP_DEBT_PENALTY_DIVISOR
  )
  if (debtPenalty > 0) {
    score -= debtPenalty
    factors.push({
      id: "debt",
      label: "XP debt drag",
      impact: -debtPenalty,
    })
  }

  const listeningBonus = Math.min(
    READINESS_CONFIG.LISTENING_BONUS_CAP,
    player.stats.listening * READINESS_CONFIG.LISTENING_BONUS_PER_POINT
  )
  if (listeningBonus > 0) {
    score += listeningBonus
    factors.push({
      id: "listening",
      label: "Signal intercept training",
      impact: listeningBonus,
    })
  }

  if (input.quest?.type === "LISTENING" && player.stats.listening < 15) {
    score -= 8
    factors.push({
      id: "listen-mission",
      label: "Listening contract strain",
      impact: -8,
    })
  }

  if (input.quest?.type === "DUNGEON") {
    score -= 5
    factors.push({
      id: "dungeon",
      label: "Sector deployment overhead",
      impact: -5,
    })
  }

  const preparationScore = Math.min(100, Math.max(0, Math.round(score)))
  const band = survivalBand(preparationScore)

  return {
    preparationScore,
    survivalBand: band,
    survivalLabel: survivalLabel(band),
    factors,
  }
}
