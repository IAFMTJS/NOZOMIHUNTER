import type {
  VocabularyEncounterContract,
  VocabularyWordContract,
} from "@/contracts/encounter-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { attachChallengeFields } from "@/systems/learning/challengeDisplaySystem"
import {
  afterCorrectAnswer,
  afterWrongAnswer,
  pressureFeedbackLine,
} from "@/systems/learning/encounterPressureSystem"
import { matchesChallengeAnswer } from "@/systems/learning/answerValidationSystem"
import { toEncounterWord } from "@/services/jmdict/normalize"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import { pickWordsByFrequency } from "@/systems/mastery/frequencySystem"
import { getMasteryMap, recordWordAnswer } from "@/systems/mastery/masterySystem"
import { advanceObjective } from "./questValidator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { pickFromSectorPool } from "@/systems/vocabulary/sectorWordPoolSystem"
import type { SectorId } from "@/contracts/sector-contract"
import { advanceSurvivalWave } from "@/systems/training/survivalVocabSystem"

export function pickVocabularyWords(count: number): VocabularyWordContract[] {
  const index = getVocabularyCatalog()
  const masteryMap = getMasteryMap()
  const picked = pickWordsByFrequency(index, {
    count,
    masteryByWord: masteryMap,
  })
  return picked.map((entry) => {
    const word = toEncounterWord(entry)
    const mastery = masteryMap.get(word.id) ?? 0
    return attachChallengeFields(word, mastery)
  })
}

export function createVocabularyEncounter(
  wordCount: number,
  sectorId?: SectorId | string
): VocabularyEncounterContract {
  const words = sectorId
    ? pickFromSectorPool(wordCount, sectorId)
    : pickVocabularyWords(wordCount)
  return {
    words,
    currentIndex: 0,
    wrongAttempts: 0,
    correctStreak: 0,
  }
}

export function getCurrentWord(
  encounter: VocabularyEncounterContract
): VocabularyWordContract | null {
  return encounter.words[encounter.currentIndex] ?? null
}

export function checkVocabularyAnswer(
  encounter: VocabularyEncounterContract,
  answer: string
): boolean {
  const word = getCurrentWord(encounter)
  if (!word) return false
  return matchesChallengeAnswer(word, answer, "RETRIEVE_ENGLISH")
}

export interface VocabularyAnswerResult {
  quest: QuestContract
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  wordId: string | null
  masteryUpdate: ReturnType<typeof recordWordAnswer> | null
  pressureLine: string | null
}

export function submitVocabularyAnswer(
  quest: QuestContract,
  answer: string,
  playerId?: string,
  maxWrongAttempts: number = VOCABULARY_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS
): VocabularyAnswerResult {
  const encounter = quest.vocabularyEncounter
  if (!encounter) {
    throw new Error("Quest has no vocabulary encounter")
  }

  const correct = checkVocabularyAnswer(encounter, answer)
  const currentWord = getCurrentWord(encounter)
  const wordId = currentWord?.id ?? null
  const masteryUpdate = wordId
    ? recordWordAnswer(wordId, correct, playerId)
    : null

  const pressureState = {
    correctStreak: encounter.correctStreak ?? 0,
    wrongAttempts: encounter.wrongAttempts,
  }

  if (!correct) {
    const nextPressure = afterWrongAnswer(pressureState)
    const wrongAttempts = encounter.wrongAttempts + 1
    const failLimit = encounter.survivalMode ? 1 : maxWrongAttempts
    const encounterFailed = wrongAttempts >= failLimit

    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      wordId,
      encounterFailed,
      previousStreak: pressureState.correctStreak,
    })

    return {
      quest: {
        ...quest,
        vocabularyEncounter: {
          ...encounter,
          wrongAttempts,
          correctStreak: 0,
        },
      },
      correct: false,
      encounterFailed,
      encounterComplete: false,
      wordId,
      masteryUpdate,
      pressureLine: pressureFeedbackLine(nextPressure),
    }
  }

  const nextPressure = afterCorrectAnswer(pressureState)
  const nextIndex = encounter.currentIndex + 1
  let updatedEncounter: VocabularyEncounterContract = {
    ...encounter,
    currentIndex: nextIndex,
    correctStreak: nextPressure.correctStreak,
    wrongAttempts: encounter.wrongAttempts,
  }
  if (encounter.survivalMode) {
    updatedEncounter = advanceSurvivalWave(updatedEncounter)
  }

  const updatedObjectives = advanceObjective(quest.objectives, "obj-1", 1)
  const encounterComplete = nextIndex >= encounter.words.length

  eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, {
    questId: quest.id,
    wordId,
    encounterComplete,
    correctStreak: nextPressure.correctStreak,
  })

  return {
    quest: {
      ...quest,
      vocabularyEncounter: updatedEncounter,
      objectives: updatedObjectives,
    },
    correct: true,
    encounterFailed: false,
    encounterComplete,
    wordId,
    masteryUpdate,
    pressureLine: pressureFeedbackLine(nextPressure),
  }
}
