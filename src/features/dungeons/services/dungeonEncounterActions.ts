import { submitConversationMessage } from "@/systems/quests/conversationEncounterSystem"
import { applySpeechAnalysis, getCurrentPhrase } from "@/systems/quests/speechEncounterSystem"
import {
  loadPlayerAiState,
  savePlayerAiState,
} from "@/services/supabase/conversationRepository"
import { transcribeAndAnalyze } from "@/services/speech/transcribe"
import {
  applyWrongAnswerCorruption,
  persistMasteryUpdate,
  runVocabularySubmit,
  runListeningSubmit,
  maxWrongForPenalties,
} from "@/features/encounters/encounterSubmitAdapter"
import type { QuestContract } from "@/contracts/quest-contract"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { nextPeakEncounterStreak } from "@/systems/learning/encounterPressureSystem"
import {
  getDungeonQuest,
  handleDungeonFailure,
  onSectorCleared,
  persistDungeonQuest,
  assertDungeonTimedOut,
} from "./dungeonPersistence"
import { applyEncounterAnswerConsequence } from "@/systems/dungeons/dungeonOrchestrator"

export async function submitDungeonVocabulary(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  if (await assertDungeonTimedOut(userId)) {
    return { correct: false, encounterFailed: true }
  }
  const { quest, player } = getDungeonQuest()
  if (!quest?.vocabularyEncounter || !player) return null

  const result = runVocabularySubmit(
    quest,
    answer,
    userId,
    player.penalties,
    player
  )
  await persistMasteryUpdate(userId, result.masteryUpdate)

  if (!result.correct && !result.encounterFailed) {
    const store = usePlayerStore.getState()
    const nextPenalties = applyWrongAnswerCorruption(
      player.penalties,
      quest.isTutorial
    )
    if (nextPenalties !== player.penalties) {
      store.applyPenalties(nextPenalties)
    }
  }

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return { correct: false, encounterFailed: true }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return { correct: true, encounterFailed: false }
  }

  let withStreak = patchDungeonPeakStreak(result.quest)
  if (result.correct) {
    withStreak = applyEncounterAnswerConsequence(withStreak, true)
  }
  await persistDungeonQuest(userId, withStreak)
  return { correct: result.correct, encounterFailed: false }
}

export async function submitDungeonListening(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  if (await assertDungeonTimedOut(userId)) {
    return { correct: false, encounterFailed: true }
  }
  const { quest, player } = getDungeonQuest()
  if (!quest?.listeningEncounter || !player) return null

  const result = runListeningSubmit(quest, answer, player.penalties, player)

  if (!result.correct && !result.encounterFailed) {
    const store = usePlayerStore.getState()
    const nextPenalties = applyWrongAnswerCorruption(
      player.penalties,
      quest.isTutorial
    )
    if (nextPenalties !== player.penalties) {
      store.applyPenalties(nextPenalties)
    }
  }

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return { correct: false, encounterFailed: true }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return { correct: true, encounterFailed: false }
  }

  let withStreak = patchDungeonPeakStreak(result.quest)
  if (result.correct) {
    withStreak = applyEncounterAnswerConsequence(withStreak, true)
  }
  await persistDungeonQuest(userId, withStreak)
  return { correct: result.correct, encounterFailed: false }
}

function patchDungeonPeakStreak(quest: QuestContract) {
  const run = quest.dungeonRun
  if (!run) return quest
  const peak = nextPeakEncounterStreak(run.peakEncounterStreak, quest)
  if (peak === (run.peakEncounterStreak ?? 0)) return quest
  return { ...quest, dungeonRun: { ...run, peakEncounterStreak: peak } }
}

export async function submitDungeonConversation(
  userId: string,
  message: string
): Promise<{
  passed: boolean
  encounterFailed: boolean
  feedback: string
  directorReply: string
} | null> {
  if (await assertDungeonTimedOut(userId)) {
    return {
      passed: false,
      encounterFailed: true,
      feedback: "Sector timer expired.",
      directorReply: "",
    }
  }
  const { quest, player } = getDungeonQuest()
  if (!quest?.conversationEncounter || !player) return null

  const aiState = await loadPlayerAiState(userId)
  const result = await submitConversationMessage(
    quest,
    message,
    userId,
    aiState.memory
  )

  await savePlayerAiState(
    userId,
    result.memory,
    result.quest.conversationEncounter!.messages,
    aiState.conversationId
  )

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return {
      passed: false,
      encounterFailed: true,
      feedback: result.feedback,
      directorReply: result.aiResponse.response,
    }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return {
      passed: result.passed,
      encounterFailed: false,
      feedback: result.feedback,
      directorReply: result.aiResponse.response,
    }
  }

  await persistDungeonQuest(userId, result.quest)
  return {
    passed: result.passed,
    encounterFailed: false,
    feedback: result.feedback,
    directorReply: result.aiResponse.response,
  }
}

export async function submitDungeonSpeech(
  userId: string,
  transcript: string,
  responseTimeMs: number
): Promise<{
  passed: boolean
  encounterFailed: boolean
  feedback: string
  compositeScore: number
} | null> {
  if (await assertDungeonTimedOut(userId)) {
    return {
      passed: false,
      encounterFailed: true,
      feedback: "Sector timer expired.",
      compositeScore: 0,
    }
  }
  const { quest, player } = getDungeonQuest()
  if (!quest?.speechEncounter || !player) return null

  const phrase = getCurrentPhrase(quest.speechEncounter)
  if (!phrase) return null

  const analysis = await transcribeAndAnalyze({
    transcript,
    playerId: userId,
    phrase,
    responseTimeMs,
    difficulty: quest.difficulty,
  })

  const result = applySpeechAnalysis(
    quest,
    analysis,
    maxWrongForPenalties(player.penalties, player)
  )

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return {
      passed: false,
      encounterFailed: true,
      feedback: analysis.feedback,
      compositeScore: analysis.compositeScore,
    }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return {
      passed: true,
      encounterFailed: false,
      feedback: analysis.feedback,
      compositeScore: analysis.compositeScore,
    }
  }

  await persistDungeonQuest(userId, result.quest)
  return {
    passed: result.passed,
    encounterFailed: false,
    feedback: analysis.feedback,
    compositeScore: analysis.compositeScore,
  }
}
