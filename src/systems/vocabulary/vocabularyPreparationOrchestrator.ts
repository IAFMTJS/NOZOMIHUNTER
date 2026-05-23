import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { QuestVocabularyPreparationContract } from "@/contracts/vocabulary-contract"
import { getMasteryMap } from "@/systems/mastery/masterySystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import {
  generateVocabularyExplanationForWord,
  threatContextFromQuest,
  type VocabularyExplanation,
} from "./vocabularyExplanationSystem"
import { generateQuestPreparationBriefing } from "./vocabularyPreparationSystem"
import {
  prioritizeCriticalVocabulary,
  vocabularyForBriefingDisplay,
} from "./vocabularyPrioritySystem"
import { isUnknownForPreparation } from "./vocabularyMasteryBridge"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export function collectQuestVocabularyTargets(quest: QuestContract): string[] {
  const targets = new Set<string>()

  for (const word of quest.vocabularyEncounter?.words ?? []) {
    targets.add(word.id)
  }

  for (const phrase of quest.speechEncounter?.phrases ?? []) {
    targets.add(phrase.id)
  }

  return [...targets]
}

function buildTargetExplanations(
  targets: string[],
  quest: QuestContract
): VocabularyExplanation[] {
  const ctx = threatContextFromQuest(quest)
  return targets.map((wordId) =>
    generateVocabularyExplanationForWord(wordId, ctx)
  )
}

export function buildVocabularyPreparation(
  quest: QuestContract,
  options?: { playerId?: string; player?: PlayerContract }
): QuestVocabularyPreparationContract {
  const playerId = options?.playerId
  const targets = collectQuestVocabularyTargets(quest)

  if (!targets.length) {
    return {
      questId: quest.id,
      preparationScore: 100,
      newVocabulary: [],
      briefingDismissed: false,
    }
  }

  const masteryMap = getMasteryMap()
  const unknownWords = targets.filter(
    (wordId) => isUnknownForPreparation(masteryMap.get(wordId) ?? 0)
  )

  const threatCtx = threatContextFromQuest(quest)
  const unknownExplanations = unknownWords.map((wordId) =>
    generateVocabularyExplanationForWord(wordId, threatCtx)
  )
  const displayVocabulary = vocabularyForBriefingDisplay(
    unknownExplanations.length > 0
      ? unknownExplanations
      : buildTargetExplanations(targets, quest)
  )

  const scoreBasis = prioritizeCriticalVocabulary(unknownExplanations)
  const briefing = generateQuestPreparationBriefing(
    quest.id,
    scoreBasis.length > 0 ? scoreBasis : unknownExplanations
  )

  const readiness = options?.player
    ? computeReadiness({
        player: options.player,
        vocabularyScore: briefing.preparationScore,
        quest,
      })
    : null
  const preparationScore =
    readiness?.preparationScore ?? briefing.preparationScore

  if (
    playerId &&
    displayVocabulary.length > 0 &&
    !quest.vocabularyPreparation
  ) {
    eventBus.emit(GAME_EVENTS.VOCABULARY_PREPARATION_READY, {
      playerId,
      questId: quest.id,
      wordCount: displayVocabulary.length,
      preparationScore,
    })
  }

  return {
    questId: quest.id,
    preparationScore,
    newVocabulary: unknownExplanations,
    briefingDismissed: false,
  }
}

export function attachVocabularyPreparation(
  quest: QuestContract,
  options?: { playerId?: string; player?: PlayerContract }
): QuestContract {
  const vocabularyPreparation = buildVocabularyPreparation(quest, options)
  return { ...quest, vocabularyPreparation }
}

export function shouldShowPreparationBriefing(
  quest: QuestContract
): boolean {
  const prep = quest.vocabularyPreparation
  if (!prep || prep.briefingDismissed) return false
  return collectQuestVocabularyTargets(quest).length > 0
}

/** Words shown in the briefing panel (unknown first, else full target roster). */
export function getPreparationDisplayVocabulary(
  quest: QuestContract
): VocabularyExplanation[] {
  const prep = quest.vocabularyPreparation
  const targets = collectQuestVocabularyTargets(quest)
  if (!prep || !targets.length) return []

  if (prep.newVocabulary.length > 0) {
    return vocabularyForBriefingDisplay(prep.newVocabulary)
  }

  return vocabularyForBriefingDisplay(buildTargetExplanations(targets, quest))
}

export function hasActivePreparationPhase(quest: QuestContract): boolean {
  return shouldShowPreparationBriefing(quest)
}
