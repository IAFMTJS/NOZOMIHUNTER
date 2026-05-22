import type { SpeechEncounterContract } from "@/contracts/encounter-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { SpeechAnalysisContract } from "@/contracts/speech-contract"
import { SPEECH_ENCOUNTER_CONFIG } from "@/config/speechEncounterConfig"
import { getSpeechScenario } from "@/config/speechContentConfig"
import { pickVocabularyWords } from "./vocabularyEncounterSystem"
import { advanceObjective } from "./questValidator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export function pickSpeechPhrases(
  count: number
): SpeechEncounterContract["phrases"] {
  return pickVocabularyWords(count)
}

export function createSpeechEncounter(
  scenarioId?: string,
  phraseCount = SPEECH_ENCOUNTER_CONFIG.DEFAULT_PHRASE_COUNT
): SpeechEncounterContract {
  const scenario = getSpeechScenario(scenarioId ?? "field-relay")
  return {
    scenarioId: scenario.id,
    briefing: scenario.briefing,
    phrases: pickSpeechPhrases(phraseCount),
    currentIndex: 0,
    wrongAttempts: 0,
    attempts: [],
  }
}

export function getCurrentPhrase(
  encounter: SpeechEncounterContract
): SpeechEncounterContract["phrases"][number] | null {
  return encounter.phrases[encounter.currentIndex] ?? null
}

export interface SpeechSubmitResult {
  quest: QuestContract
  analysis: SpeechAnalysisContract
  passed: boolean
  encounterFailed: boolean
  encounterComplete: boolean
}

export function applySpeechAnalysis(
  quest: QuestContract,
  analysis: SpeechAnalysisContract,
  maxWrongAttempts: number = SPEECH_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS
): SpeechSubmitResult {
  const encounter = quest.speechEncounter
  if (!encounter) {
    throw new Error("Quest has no speech encounter")
  }

  const attempt = {
    transcript: analysis.transcript,
    compositeScore: analysis.compositeScore,
    passed: analysis.passed,
    responseTimeMs: analysis.responseTimeMs,
    timestamp: new Date().toISOString(),
  }

  const attempts = [...encounter.attempts, attempt]

  if (!analysis.passed) {
    const wrongAttempts = encounter.wrongAttempts + 1
    const encounterFailed = wrongAttempts >= maxWrongAttempts

    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      encounterFailed,
    })

    return {
      quest: {
        ...quest,
        speechEncounter: { ...encounter, wrongAttempts, attempts },
      },
      analysis,
      passed: false,
      encounterFailed,
      encounterComplete: false,
    }
  }

  const nextIndex = encounter.currentIndex + 1
  const updatedEncounter: SpeechEncounterContract = {
    ...encounter,
    currentIndex: nextIndex,
    attempts,
  }
  const updatedObjectives = advanceObjective(quest.objectives, "obj-1", 1)
  const encounterComplete = nextIndex >= encounter.phrases.length

  eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, {
    questId: quest.id,
    encounterComplete,
  })

  return {
    quest: {
      ...quest,
      speechEncounter: updatedEncounter,
      objectives: updatedObjectives,
    },
    analysis,
    passed: true,
    encounterFailed: false,
    encounterComplete,
  }
}
