import type { QuestVocabularyPreparationContract } from "@/contracts/vocabulary-contract"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"
import type { VocabularyExplanation } from "./vocabularyExplanationSystem"

export function generateQuestPreparationBriefing(
  questId: string,
  vocabulary: VocabularyExplanation[]
): Pick<
  QuestVocabularyPreparationContract,
  "questId" | "preparationScore" | "newVocabulary"
> {

  const preparationScore = Math.max(
    0,
    100 -
      vocabulary.length *
        VOCABULARY_PREPARATION_CONFIG.PREPARATION_PENALTY_PER_WORD
  )

  return {
    questId,
    preparationScore,
    newVocabulary: vocabulary
  }
}