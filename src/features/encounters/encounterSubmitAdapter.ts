import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { submitVocabularyAnswer } from "@/systems/quests/vocabularyEncounterSystem"
import { submitListeningAnswer } from "@/systems/dungeons/listeningEncounterSystem"
import { maxWrongAttemptsForPenalties } from "@/systems/penalties/penaltyGameplaySystem"
import { upsertWordMastery } from "@/services/supabase/vocabularyRepository"

export function maxWrongForPenalties(penalties: PlayerPenaltyContract): number {
  return maxWrongAttemptsForPenalties(penalties)
}

export async function persistMasteryUpdate(
  userId: string,
  update: WordMasteryContract | null | undefined
): Promise<void> {
  if (!update) return
  try {
    await upsertWordMastery(userId, update)
  } catch {
    /* non-blocking — mastery syncs on next save */
  }
}

export function runVocabularySubmit(
  quest: QuestContract,
  answer: string,
  userId: string,
  penalties: PlayerPenaltyContract
) {
  return submitVocabularyAnswer(
    quest,
    answer,
    userId,
    maxWrongForPenalties(penalties)
  )
}

export function runListeningSubmit(
  quest: QuestContract,
  answer: string,
  penalties: PlayerPenaltyContract
) {
  return submitListeningAnswer(quest, answer, maxWrongForPenalties(penalties))
}
