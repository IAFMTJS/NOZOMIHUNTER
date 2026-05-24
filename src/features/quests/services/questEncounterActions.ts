import { submitConversationMessage } from "@/systems/quests/conversationEncounterSystem"
import {
  applySpeechAnalysis,
  getCurrentPhrase,
} from "@/systems/quests/speechEncounterSystem"
import { transcribeAndAnalyze } from "@/services/speech/transcribe"
import {
  loadPlayerAiState,
  savePlayerAiState,
} from "@/services/supabase/conversationRepository"
import {
  persistMasteryUpdate,
  runVocabularySubmit,
  runListeningSubmit,
  maxWrongForPenalties,
} from "@/features/encounters/encounterSubmitAdapter"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { updateUserQuest } from "@/services/supabase/playerRepository"
import { failQuestForPlayer } from "./questLifecycle"
import { persistQuestState } from "./questPersistence"
import { applyGameModeAction } from "@/systems/gameModes/gameModeEncounterSystem"
import { recordGameModeAnalytics } from "@/systems/analytics/gameModeAnalytics"

export async function submitGameModeActionForQuest(
  userId: string,
  questId: string,
  action: string,
  payload?: string
): Promise<{ correct: boolean; encounterFailed: boolean; message?: string } | null> {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest || !store.player) return null

  const result = applyGameModeAction(quest, action, payload)
  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)

  recordGameModeAnalytics("ENCOUNTER_ANSWER_CORRECT", result.quest.gameMode, {
    action,
    correct: result.correct,
  })

  const complete = result.quest.objectives.every((o) => o.completed)
  if (complete) {
    await persistQuestState()
  } else {
    await persistQuestState()
  }

  return {
    correct: result.correct ?? false,
    encounterFailed: result.encounterFailed ?? false,
    message: result.message,
  }
}

export async function submitVocabularyAnswerForQuest(
  userId: string,
  questId: string,
  answer: string
): Promise<{
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
} | null> {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest?.vocabularyEncounter || !store.player) return null

  const result = runVocabularySubmit(
    quest,
    answer,
    userId,
    store.player.penalties,
    store.player
  )
  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)
  await persistMasteryUpdate(userId, result.masteryUpdate)

  if (result.encounterFailed) {
    await failQuestForPlayer(userId, questId)
    return {
      correct: false,
      encounterFailed: true,
      encounterComplete: false,
    }
  }

  await persistQuestState()
  return {
    correct: result.correct,
    encounterFailed: false,
    encounterComplete: result.encounterComplete,
  }
}

export async function submitConversationMessageForQuest(
  userId: string,
  questId: string,
  message: string
): Promise<{
  passed: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  feedback: string
  directorReply: string
} | null> {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest?.conversationEncounter || !store.player) return null

  const aiState = await loadPlayerAiState(userId)
  const result = await submitConversationMessage(
    quest,
    message,
    userId,
    aiState.memory
  )

  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)

  await savePlayerAiState(
    userId,
    result.memory,
    result.quest.conversationEncounter!.messages,
    aiState.conversationId
  )

  if (result.encounterFailed) {
    await failQuestForPlayer(userId, questId)
    return {
      passed: false,
      encounterFailed: true,
      encounterComplete: false,
      feedback: result.feedback,
      directorReply: result.aiResponse.response,
    }
  }

  await persistQuestState()
  return {
    passed: result.passed,
    encounterFailed: false,
    encounterComplete: result.encounterComplete,
    feedback: result.feedback,
    directorReply: result.aiResponse.response,
  }
}

export async function submitSpeechForQuest(
  userId: string,
  questId: string,
  transcript: string,
  responseTimeMs: number
): Promise<{
  passed: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  feedback: string
  compositeScore: number
} | null> {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest?.speechEncounter || !store.player) return null

  const phrase = getCurrentPhrase(quest.speechEncounter)
  if (!phrase) return null

  let analysis
  try {
    analysis = await transcribeAndAnalyze({
      transcript,
      playerId: userId,
      phrase,
      responseTimeMs,
      difficulty: quest.difficulty,
    })
  } catch (e) {
    throw e instanceof Error ? e : new Error("Speech analysis failed")
  }

  const result = applySpeechAnalysis(
    quest,
    analysis,
    maxWrongForPenalties(store.player.penalties, store.player)
  )
  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)

  if (result.encounterFailed) {
    await failQuestForPlayer(userId, questId)
    return {
      passed: false,
      encounterFailed: true,
      encounterComplete: false,
      feedback: analysis.feedback,
      compositeScore: analysis.compositeScore,
    }
  }

  await persistQuestState()
  return {
    passed: result.passed,
    encounterFailed: false,
    encounterComplete: result.encounterComplete,
    feedback: analysis.feedback,
    compositeScore: analysis.compositeScore,
  }
}

export async function submitListeningAnswerForQuest(
  userId: string,
  questId: string,
  answer: string
): Promise<{
  correct: boolean
  encounterFailed: boolean
  encounterComplete: boolean
} | null> {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest?.listeningEncounter || !store.player) return null

  const result = runListeningSubmit(
    quest,
    answer,
    store.player.penalties,
    store.player,
    userId
  )
  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)

  if (result.encounterFailed) {
    await failQuestForPlayer(userId, questId)
    return {
      correct: false,
      encounterFailed: true,
      encounterComplete: false,
    }
  }

  await persistQuestState()
  return {
    correct: result.correct,
    encounterFailed: false,
    encounterComplete: result.encounterComplete,
  }
}
