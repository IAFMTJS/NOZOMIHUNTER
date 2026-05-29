import type { QuestContract } from "@/contracts/quest-contract"
import {
  comboDecayMultiplier,
  effectiveComboScore,
} from "@/systems/training/arcadeComboDecaySystem"

export interface ArcadeSessionHudViewModel {
  combo: number
  accuracyPercent: number
  score: number
}

export function buildArcadeSessionHud(quest: QuestContract): ArcadeSessionHudViewModel {
  const vocab = quest.vocabularyEncounter
  const words = vocab?.words.length ?? 1
  const index = vocab?.currentIndex ?? 0
  const streak = vocab?.correctStreak ?? 0
  const correct = index + (streak > 0 ? 1 : 0)
  const accuracyPercent =
    words > 0 ? Math.min(100, Math.round((correct / words) * 100)) : 100

  const decay = comboDecayMultiplier(undefined)
  return {
    combo: streak,
    accuracyPercent,
    score: effectiveComboScore(correct + streak, decay) + correct * 80,
  }
}
