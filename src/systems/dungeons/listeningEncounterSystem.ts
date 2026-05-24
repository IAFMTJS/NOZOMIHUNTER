import type {
  ListeningEncounterContract,
  ListeningFragmentContract,
} from "@/contracts/encounter-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { pickVocabularyWords } from "@/systems/quests/vocabularyEncounterSystem"
import {
  defaultListeningDirection,
  resolveInputMode,
} from "@/systems/learning/challengeDisplaySystem"
import {
  afterCorrectAnswer,
  afterWrongAnswer,
  pressureFeedbackLine,
  replayDegradationLine,
} from "@/systems/learning/encounterPressureSystem"
import { matchesChallengeAnswer } from "@/systems/learning/answerValidationSystem"
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
  const direction = defaultListeningDirection()
  const inputMode = resolveInputMode(direction)
  const fragments: ListeningFragmentContract[] = words.map((w) => ({
    id: w.id,
    japanese: w.japanese,
    reading: w.reading,
    romaji: w.romaji,
    meanings: w.meanings,
    promptDirection: direction,
    inputMode,
  }))

  return {
    briefing,
    fragments,
    currentIndex: 0,
    wrongAttempts: 0,
    correctStreak: 0,
    replayCount: 0,
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
  return matchesChallengeAnswer(fragment, answer, "LISTEN_DECODE")
}

export interface ListeningAnswerResult {
  quest: QuestContract
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  pressureLine: string | null
  replayLine: string | null
}

export function canSubmitListeningAnswer(
  encounter: ListeningEncounterContract,
  heardOnce: boolean
): boolean {
  return heardOnce && getCurrentFragment(encounter) != null
}

export function recordListeningReplay(
  encounter: ListeningEncounterContract,
  maxReplays: number,
  questId?: string
): { encounter: ListeningEncounterContract; replayLine: string | null } {
  const replayCount = (encounter.replayCount ?? 0) + 1
  const replayLine = replayDegradationLine(replayCount, maxReplays)
  if (replayLine && questId) {
    eventBus.emit(GAME_EVENTS.REPLAY_PENALTY, {
      questId,
      replayCount,
      maxReplays,
    })
  }
  return {
    encounter: { ...encounter, replayCount },
    replayLine,
  }
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

  const pressureState = {
    correctStreak: encounter.correctStreak ?? 0,
    wrongAttempts: encounter.wrongAttempts,
  }

  if (!correct) {
    wrongAttempts += 1
    const encounterFailed = wrongAttempts >= maxWrongAttempts
    const nextPressure = afterWrongAnswer(pressureState)

    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      encounterFailed,
    })

    return {
      quest: {
        ...quest,
        listeningEncounter: {
          ...encounter,
          wrongAttempts,
          correctStreak: 0,
        },
      },
      correct: false,
      encounterFailed,
      encounterComplete: false,
      pressureLine: pressureFeedbackLine(nextPressure),
      replayLine: null,
    }
  }

  const fragmentId = fragment?.id
  if (userId && fragmentId) {
    recordWordAnswer(fragmentId, true, userId)
  }

  const nextPressure = afterCorrectAnswer(pressureState)
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
        correctStreak: nextPressure.correctStreak,
        revealFragmentId: fragmentId ?? null,
        replayCount: 0,
      },
      objectives: updatedObjectives,
    },
    correct: true,
    encounterFailed: false,
    encounterComplete,
    pressureLine: pressureFeedbackLine(nextPressure),
    replayLine: null,
  }
}
