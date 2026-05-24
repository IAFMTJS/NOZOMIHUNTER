import type { VocabularyThreatLevel } from "@/contracts/vocabulary-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  isBossCriticalWord,
  isDungeonSectorCriticalWord,
} from "@/config/vocabularyThreatMetadata"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"

export interface ThreatContext {
  questType?: QuestContract["type"]
  dungeonKey?: string
  isBossTarget?: boolean
}

const FREQUENCY_TO_THREAT: Record<number, VocabularyThreatLevel> = {
  1: "CRITICAL",
  2: "CRITICAL",
  3: "ELEVATED",
  4: "ELEVATED",
  5: "ROUTINE",
}

export function threatFromFrequencyTier(tier: number): VocabularyThreatLevel {
  if (tier <= 2) return FREQUENCY_TO_THREAT[1]!
  if (tier <= 4) return FREQUENCY_TO_THREAT[3]!
  return "ROUTINE"
}

function applyInstabilityBump(
  level: VocabularyThreatLevel,
  instability: number
): VocabularyThreatLevel {
  if (instability < 70) return level
  if (level === "ROUTINE") return "ELEVATED"
  if (level === "ELEVATED") return "CRITICAL"
  return level
}

export function resolveVocabularyThreat(
  wordId: string,
  context: ThreatContext = {},
  instability = 0
): VocabularyThreatLevel {
  const entry = getVocabularyCatalog().byId.get(wordId)
  let level = entry
    ? threatFromFrequencyTier(entry.frequencyTier)
    : "ELEVATED"

  if (
    context.isBossTarget ||
    isBossCriticalWord(wordId) ||
    isDungeonSectorCriticalWord(wordId, context.dungeonKey)
  ) {
    return "SECTOR_CRITICAL"
  }

  if (context.questType === "DUNGEON" || context.dungeonKey) {
    if (level === "ROUTINE") level = "ELEVATED"
    else if (level === "ELEVATED") level = "CRITICAL"
  }

  if (context.questType === "LISTENING" && level === "ROUTINE") {
    level = "ELEVATED"
  }

  return applyInstabilityBump(level, instability)
}

export function threatDisplayLabel(level: VocabularyThreatLevel): string {
  switch (level) {
    case "SECTOR_CRITICAL":
      return "Sector critical"
    case "CRITICAL":
      return "Critical"
    case "ELEVATED":
      return "Elevated"
    case "ROUTINE":
      return "Routine"
  }
}

export function importanceFromThreat(
  level: VocabularyThreatLevel
): "LOW" | "MEDIUM" | "HIGH" {
  switch (level) {
    case "SECTOR_CRITICAL":
    case "CRITICAL":
      return "HIGH"
    case "ELEVATED":
      return "MEDIUM"
    case "ROUTINE":
      return "LOW"
  }
}
