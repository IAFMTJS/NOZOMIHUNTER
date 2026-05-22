import { submitVocabularyAnswer } from "@/systems/quests/vocabularyEncounterSystem"
import { submitConversationMessage } from "@/systems/quests/conversationEncounterSystem"
import { applySpeechAnalysis, getCurrentPhrase } from "@/systems/quests/speechEncounterSystem"
import { submitListeningAnswer } from "@/systems/dungeons/listeningEncounterSystem"
import {
  loadPlayerAiState,
  savePlayerAiState,
} from "@/services/supabase/conversationRepository"
import { transcribeAndAnalyze } from "@/services/speech/transcribe"
import { upsertWordMastery } from "@/services/supabase/vocabularyRepository"
import {
  getDungeonQuest,
  handleDungeonFailure,
  onSectorCleared,
  persistDungeonQuest,
} from "./dungeonPersistence"
import { maxWrongAttemptsForPenalties } from "@/systems/penalties/penaltyGameplaySystem"

export async function submitDungeonVocabulary(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  const { quest, player } = getDungeonQuest()
  if (!quest?.vocabularyEncounter || !player) return null

  const maxWrong = maxWrongAttemptsForPenalties(player.penalties)
  const result = submitVocabularyAnswer(quest, answer, userId, maxWrong)
  if (result.masteryUpdate) {
    try {
      await upsertWordMastery(userId, result.masteryUpdate)
    } catch {
      /* non-blocking */
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

  await persistDungeonQuest(userId, result.quest)
  return { correct: result.correct, encounterFailed: false }
}

export async function submitDungeonListening(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  const { quest, player } = getDungeonQuest()
  if (!quest?.listeningEncounter || !player) return null

  const maxWrong = maxWrongAttemptsForPenalties(player.penalties)
  const result = submitListeningAnswer(quest, answer, maxWrong)

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return { correct: false, encounterFailed: true }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return { correct: true, encounterFailed: false }
  }

  await persistDungeonQuest(userId, result.quest)
  return { correct: result.correct, encounterFailed: false }
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

  const maxWrong = maxWrongAttemptsForPenalties(player.penalties)
  const result = applySpeechAnalysis(quest, analysis, maxWrong)

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
