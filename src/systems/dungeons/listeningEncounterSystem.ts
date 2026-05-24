import type {
  ListeningEncounterContract,
  ListeningFragmentContract,
} from "@/contracts/encounter-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { pickVocabularyWords } from "@/systems/quests/vocabularyEncounterSystem"
import {
  normalizeAnswer,
  normalizeJapanese,
  readingToRomaji,
} from "@/services/jmdict/normalize"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { advanceObjective } from "@/systems/quests/questValidator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { recordWordAnswer } from "@/systems/mastery/masterySystem"

export function createListeningEncounter(
  fragmentCount: number,
  briefing: string
): ListeningEncounterContract {
  const words = pickVocabularyWords(fragmentCount)
  const fragments: ListeningFragmentContract[] = words.map((w) => ({
    id: w.id,
    japanese: w.japanese,
    reading: w.reading,
    romaji: w.romaji,
    meanings: w.meanings,
  }))

  return {
    briefing,
    fragments,
    currentIndex: 0,
    wrongAttempts: 0,
  }
}

export function getCurrentFragment(
  encounter: ListeningEncounterContract
): ListeningFragmentContract | null {
  return encounter.fragments[encounter.currentIndex] ?? null
}

export function checkListeningAnswer(
  encounter: ListeningEncounterContract,
  answer: string
): boolean {
  const fragment = getCurrentFragment(encounter)
  if (!fragment) return false

  const normalized = normalizeAnswer(answer)
  if (!normalized) return false

  const accepted = new Set<string>([
    normalizeAnswer(fragment.romaji),
    readingToRomaji(fragment.reading),
    normalizeJapanese(fragment.reading),
    normalizeJapanese(fragment.japanese),
    ...fragment.meanings.map(normalizeAnswer),
  ])

  return accepted.has(normalized)
}

export interface ListeningAnswerResult {
  quest: QuestContract
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
}

export function canSubmitListeningAnswer(
  encounter: ListeningEncounterContract,
  heardOnce: boolean
): boolean {
  return heardOnce && getCurrentFragment(encounter) != null
}

export function submitListeningAnswer(
  quest: QuestContract,
  answer: string,
  maxWrongAttempts: number = VOCABULARY_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS,
  userId?: string
): ListeningAnswerResult {
  const encounter = quest.listeningEncounter
  if (!encounter) {
    throw new Error("Quest has no listening encounter")
  }

  const fragment = getCurrentFragment(encounter)
  const correct = checkListeningAnswer(encounter, answer)
  let wrongAttempts = encounter.wrongAttempts
  let currentIndex = encounter.currentIndex

  if (!correct) {
    wrongAttempts += 1
    const encounterFailed = wrongAttempts >= maxWrongAttempts

    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      encounterFailed,
    })

    return {
      quest: {
        ...quest,
        listeningEncounter: { ...encounter, wrongAttempts },
      },
      correct: false,
      encounterFailed,
      encounterComplete: false,
    }
  }

  const fragmentId = fragment?.id
  if (userId && fragmentId) {
    recordWordAnswer(fragmentId, true, userId)
  }

  currentIndex += 1
  const encounterComplete = currentIndex >= encounter.fragments.length
  const updatedObjectives = advanceObjective(quest.objectives, "obj-1", 1)

  eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, {
    questId: quest.id,
    encounterComplete,
  })

  return {
    quest: {
      ...quest,
      listeningEncounter: {
        ...encounter,
        currentIndex,
        wrongAttempts,
      },
      objectives: updatedObjectives,
    },
    correct: true,
    encounterFailed: false,
    encounterComplete,
  }
}
