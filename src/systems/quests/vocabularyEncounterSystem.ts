import type { VocabularyEncounterContract } from "@/contracts/encounter-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import {
  normalizeAnswer,
  normalizeJapanese,
  readingToRomaji,
  toEncounterWord,
} from "@/services/jmdict/normalize"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import { pickWordsByFrequency } from "@/systems/mastery/frequencySystem"
import { getMasteryMap, recordWordAnswer } from "@/systems/mastery/masterySystem"
import { advanceObjective } from "./questValidator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export function pickVocabularyWords(count: number): VocabularyEncounterContract["words"] {
  const index = getVocabularyCatalog()
  const picked = pickWordsByFrequency(index, {
    count,
    masteryByWord: getMasteryMap(),
  })
  return picked.map(toEncounterWord)
}

export function createVocabularyEncounter(
  wordCount: number
): VocabularyEncounterContract {
  const words = pickVocabularyWords(wordCount)
  return {
    words,
    currentIndex: 0,
    wrongAttempts: 0,
  }
}

export function getCurrentWord(
  encounter: VocabularyEncounterContract
): VocabularyEncounterContract["words"][number] | null {
  return encounter.words[encounter.currentIndex] ?? null
}

export function checkVocabularyAnswer(
  encounter: VocabularyEncounterContract,
  answer: string
): boolean {
  const word = getCurrentWord(encounter)
  if (!word) return false

  const normalized = normalizeAnswer(answer)
  if (!normalized) return false

  const accepted = new Set<string>([
    normalizeAnswer(word.romaji),
    readingToRomaji(word.reading),
    normalizeJapanese(word.reading),
    normalizeJapanese(word.japanese),
    ...word.meanings.map(normalizeAnswer),
  ])

  return accepted.has(normalized)
}

export interface VocabularyAnswerResult {
  quest: QuestContract
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  wordId: string | null
  masteryUpdate: ReturnType<typeof recordWordAnswer> | null
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

  if (!correct) {
    const wrongAttempts = encounter.wrongAttempts + 1
    const encounterFailed = wrongAttempts >= maxWrongAttempts

    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      wordId,
      encounterFailed,
    })

    return {
      quest: {
        ...quest,
        vocabularyEncounter: { ...encounter, wrongAttempts },
      },
      correct: false,
      encounterFailed,
      encounterComplete: false,
      wordId,
      masteryUpdate,
    }
  }

  const nextIndex = encounter.currentIndex + 1
  const updatedEncounter: VocabularyEncounterContract = {
    ...encounter,
    currentIndex: nextIndex,
  }

  const updatedObjectives = advanceObjective(quest.objectives, "obj-1", 1)
  const encounterComplete = nextIndex >= encounter.words.length

  eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, {
    questId: quest.id,
    wordId,
    encounterComplete,
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
  }
}
