import { pickVocabularyWords } from "./vocabularyEncounterSystem"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import type { QuestContract } from "@/contracts/quest-contract"

export function assertVocabularyPoolAvailable(quest: QuestContract): void {
  if (quest.type !== "VOCABULARY") return

  const count =
    quest.vocabularyEncounter?.words.length ??
    VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT

  const available = pickVocabularyWords(count)
  if (available.length < Math.min(count, 1)) {
    throw new Error(
      "Vocabulary registry empty — cannot deploy contract. Try again after sync."
    )
  }
}
