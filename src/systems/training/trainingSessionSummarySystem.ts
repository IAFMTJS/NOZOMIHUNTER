import type { QuestContract } from "@/contracts/quest-contract"
import { disciplineEarnedForQuest } from "@/systems/progression/disciplineCurrencySystem"

export interface TrainingSessionSummaryViewModel {
  xpGained: number
  disciplineGained: number
  accuracyPercent: number
  comboPeak: number
  modeLabel: string
}

export function buildTrainingSessionSummary(
  quest: QuestContract
): TrainingSessionSummaryViewModel {
  const vocab = quest.vocabularyEncounter
  const streak = vocab?.correctStreak ?? 0
  const words = vocab?.words.length ?? 1
  const index = vocab?.currentIndex ?? 0
  const accuracyPercent =
    index > 0 ? Math.min(100, Math.round(((index + (streak > 0 ? 1 : 0)) / words) * 100)) : 98

  return {
    xpGained: quest.rewards.xp,
    disciplineGained: disciplineEarnedForQuest(quest),
    accuracyPercent,
    comboPeak: streak,
    modeLabel: quest.title,
  }
}
