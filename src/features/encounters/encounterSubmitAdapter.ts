import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract, PlayerPenaltyContract } from "@/contracts/player-contract"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { submitVocabularyAnswer } from "@/systems/quests/vocabularyEncounterSystem"
import { submitListeningAnswer } from "@/systems/dungeons/listeningEncounterSystem"
import {
  corruptionDeltaForWrongAnswer,
  maxWrongAttemptsForPenalties,
} from "@/systems/penalties/penaltyGameplaySystem"
import { mergePenalties } from "@/systems/penalties/penaltySystem"
import { maxWrongAttemptsWithBoosts } from "@/systems/economy/boostSystem"
import { upsertWordMastery } from "@/services/supabase/vocabularyRepository"

export function maxWrongForPenalties(
  penalties: PlayerPenaltyContract,
  player?: PlayerContract
): number {
  const base = maxWrongAttemptsForPenalties(penalties)
  if (!player) return base
  return maxWrongAttemptsWithBoosts(player, base)
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
  penalties: PlayerPenaltyContract,
  player?: PlayerContract
) {
  return submitVocabularyAnswer(
    quest,
    answer,
    userId,
    maxWrongForPenalties(penalties, player)
  )
}

export function applyWrongAnswerCorruption(
  penalties: PlayerPenaltyContract,
  isTutorial = false
): PlayerPenaltyContract {
  const delta = corruptionDeltaForWrongAnswer(isTutorial)
  if (!delta) return penalties
  return mergePenalties(penalties, delta)
}

export function runListeningSubmit(
  quest: QuestContract,
  answer: string,
  penalties: PlayerPenaltyContract,
  player?: PlayerContract,
  userId?: string
) {
  return submitListeningAnswer(
    quest,
    answer,
    maxWrongForPenalties(penalties, player),
    userId
  )
}
