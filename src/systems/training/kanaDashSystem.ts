import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"

/** Rapid kana recognition drill — short word list, romaji retrieval. */
export function createKanaDashEncounter() {
  return createVocabularyEncounter(5)
}
