import type {
  DeployBlockerContract,
  PreparationChecklistContract,
  ReadinessResultContract,
} from "@/contracts/readiness-contract"
import { READINESS_CONFIG } from "@/config/readinessConfig"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"
import { isReadinessHardBlocked } from "@/systems/readiness/readinessSystem"

export const MIN_OPERATIONAL_READINESS_SCORE =
  READINESS_CONFIG.SURVIVAL_THRESHOLDS.CRITICAL

export interface DeployGateInput {
  readiness: ReadinessResultContract
  checklist: PreparationChecklistContract
  allowCriticalDeploy?: boolean
  vocabularyPrep?: {
    missingCount: number
    currentScore: number
  }
}

const CHECKLIST_BLOCKERS: {
  key: keyof PreparationChecklistContract
  title: string
  detail: string
  recoveryHref: string
  recoveryLabel: string
}[] = [
  {
    key: "equipment",
    title: "Equipment not ready",
    detail: "Equip at least one loadout item before deployment.",
    recoveryHref: "/inventory",
    recoveryLabel: "Inventory",
  },
  {
    key: "skillLoadout",
    title: "Skill loadout incomplete",
    detail: "Allocate skill points or complete the operator tutorial.",
    recoveryHref: "/profile#operator-metrics",
    recoveryLabel: "Operator metrics",
  },
  {
    key: "consumables",
    title: "Consumables missing",
    detail: "Stock recovery items before entering a sector.",
    recoveryHref: "/inventory",
    recoveryLabel: "Inventory",
  },
]

export function resolveDeployBlockers(input: DeployGateInput): DeployBlockerContract[] {
  const blockers: DeployBlockerContract[] = []
  const minScore = MIN_OPERATIONAL_READINESS_SCORE

  if (
    !input.allowCriticalDeploy &&
    isReadinessHardBlocked(input.readiness)
  ) {
    const penaltySummary = input.readiness.factors
      .filter((f) => f.impact < 0)
      .map((f) => f.label)
      .join(", ")
    blockers.push({
      id: "operational-readiness",
      title: "Operational readiness below minimum",
      detail: `Current ${input.readiness.preparationScore}% — minimum ${minScore}% required.${
        penaltySummary ? ` Drag: ${penaltySummary}.` : ""
      } Reduce corruption, fatigue, or XP debt.`,
      recoveryHref: "/training",
      recoveryLabel: "Training drills",
    })
  }

  if (!input.checklist.vocabulary && input.vocabularyPrep) {
    const { missingCount, currentScore } = input.vocabularyPrep
    const minVocab = VOCABULARY_PREPARATION_CONFIG.DEPLOY_MIN_PREPARATION_SCORE
    blockers.push({
      id: "vocabulary-prep",
      title: "Mission vocabulary not synchronized",
      detail:
        missingCount > 0
          ? `${missingCount} unknown target${missingCount === 1 ? "" : "s"} — familiarity ${currentScore}% (need ${minVocab}%). Review targets below, then train in the threat index.`
          : `Vocabulary familiarity ${currentScore}% — raise to ${minVocab}% via threat index review.`,
      recoveryHref: "/vocabulary",
      recoveryLabel: "Threat index",
    })
  } else if (!input.checklist.vocabulary) {
    blockers.push({
      id: "vocabulary-prep",
      title: "Mission vocabulary not synchronized",
      detail: `Vocabulary familiarity below ${VOCABULARY_PREPARATION_CONFIG.DEPLOY_MIN_PREPARATION_SCORE}%.`,
      recoveryHref: "/vocabulary",
      recoveryLabel: "Threat index",
    })
  }

  for (const row of CHECKLIST_BLOCKERS) {
    if (!input.checklist[row.key]) {
      blockers.push({
        id: row.key,
        title: row.title,
        detail: row.detail,
        recoveryHref: row.recoveryHref,
        recoveryLabel: row.recoveryLabel,
      })
    }
  }

  return blockers
}

export function isDeployBlocked(blockers: DeployBlockerContract[]): boolean {
  return blockers.length > 0
}
