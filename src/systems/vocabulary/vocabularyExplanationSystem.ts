import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import {
  importanceFromThreat,
  resolveVocabularyThreat,
  type ThreatContext,
} from "@/systems/vocabulary/vocabularyThreatSystem"

export type VocabularyExplanation = VocabularyExplanationContract

export function generateVocabularyExplanation(
  word: string,
  context: ThreatContext = {}
): VocabularyExplanation {
  const threatLevel = resolveVocabularyThreat(word, context)
  return {
    kanji: word,
    romaji: word,
    meaning: "Mission vocabulary",
    context: "Flagged in current operation intel.",
    importance: importanceFromThreat(threatLevel),
    threatLevel,
  }
}

export function generateVocabularyExplanationForWord(
  wordId: string,
  context: ThreatContext = {}
): VocabularyExplanation {
  const entry = getVocabularyCatalog().byId.get(wordId)
  if (!entry) {
    return generateVocabularyExplanation(wordId, context)
  }

  const threatLevel = resolveVocabularyThreat(wordId, context)
  const kanji = entry.japanese[0] ?? entry.reading[0] ?? wordId
  const reading = entry.reading[0]
  return {
    kanji,
    reading,
    romaji: entry.romaji,
    meaning: entry.meanings[0] ?? "—",
    context:
      context.isBossTarget
        ? "Boss-sector terminology. Failure to recognize increases breach risk."
        : "Appears in this contract's encounter targets.",
    importance: importanceFromThreat(threatLevel),
    threatLevel,
  }
}

export function threatContextFromQuest(
  quest: Pick<QuestContract, "type" | "dungeonRun">
): ThreatContext {
  const machineState = quest.dungeonRun?.machineState
  return {
    questType: quest.type,
    dungeonKey: quest.dungeonRun?.dungeon.id,
    isBossTarget: machineState === "BOSS",
  }
}