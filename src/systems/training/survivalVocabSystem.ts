import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import type { VocabularyEncounterContract } from "@/contracts/encounter-contract"

/** One wrong answer ends the run; waves advance on each correct. */
export function createSurvivalVocabEncounter(): VocabularyEncounterContract {
  const base = createVocabularyEncounter(12)
  return {
    ...base,
    survivalMode: true,
    survivalWave: 1,
  }
}

export function advanceSurvivalWave(
  encounter: VocabularyEncounterContract
): VocabularyEncounterContract {
  return {
    ...encounter,
    survivalWave: (encounter.survivalWave ?? 1) + 1,
  }
}

export const SURVIVAL_MAX_WRONG = 1
