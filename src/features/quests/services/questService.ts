import {
  loadPlayer,
  savePlayer,
  assignQuest,
  completeUserQuest,
  failUserQuest,
  updateUserQuest,
} from "@/services/supabase/playerRepository"
import {
  generateQuestForPlayer,
  generateTutorialQuest,
} from "@/systems/quests/questGenerator"
import {
  acceptQuest,
  completeQuest,
  failQuest,
  progressQuestObjective,
} from "@/systems/quests/questOrchestrator"
import { submitVocabularyAnswer } from "@/systems/quests/vocabularyEncounterSystem"
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
import { triggerSave, registerSaveHandler } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { shouldAssignTutorialQuest } from "@/systems/tutorial/tutorialSystem"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import { repairQuestSnapshot } from "@/systems/quests/questEncounterRepair"
import { ensureVocabularyEngine } from "@/features/quests/services/vocabularyService"
import { upsertWordMastery } from "@/services/supabase/vocabularyRepository"

let saveRegistered = false

function ensureSaveHandler() {
  if (saveRegistered) return
  registerSaveHandler(async (payload) => {
    await savePlayer(payload.player, payload.activeQuests)
  })
  saveRegistered = true
}

async function persistState() {
  const { player, activeQuests } = usePlayerStore.getState()
  if (!player) return
  await triggerSave({ player, activeQuests })
}

export async function hydratePlayerFromDb(userId: string) {
  ensureSaveHandler()
  await ensureVocabularyEngine(userId)
  const data = await loadPlayer(userId)
  if (!data) return null
  const repairedQuests = data.activeQuests.map(repairQuestSnapshot)
  usePlayerStore.getState().hydrate(data.player, repairedQuests)
  const needsRepairSave = repairedQuests.some((q, i) => {
    const prev = data.activeQuests[i]
    return (
      (q.vocabularyEncounter?.words.length ?? 0) >
        (prev.vocabularyEncounter?.words.length ?? 0) ||
      (q.conversationEncounter?.messages.length ?? 0) >
        (prev.conversationEncounter?.messages.length ?? 0) ||
      (q.speechEncounter?.phrases.length ?? 0) >
        (prev.speechEncounter?.phrases.length ?? 0)
    )
  })
  if (needsRepairSave) {
    await persistState()
  }
  await ensureTutorialQuest(userId)
  return usePlayerStore.getState().player
    ? {
        player: usePlayerStore.getState().player!,
        activeQuests: usePlayerStore.getState().activeQuests,
      }
    : data
}

export async function ensureTutorialQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player || !shouldAssignTutorialQuest(player, store.activeQuests)) {
    return null
  }

  const quest = generateTutorialQuest(userId)
  acceptQuest(quest, userId)
  await assignQuest(userId, quest)

  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistState()
  return quest
}

export async function requestNewQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const quest = generateQuestForPlayer(player.level)
  acceptQuest(quest, userId)
  await assignQuest(userId, quest)

  if (store.activeQuests.some((q) => q.id === quest.id)) {
    return quest
  }

  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistState()

  return quest
}

export async function advanceQuest(
  userId: string,
  questId: string,
  objectiveId: string
) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest || !store.player) return null

  if (
    (quest.type === "VOCABULARY" && quest.vocabularyEncounter) ||
    (quest.type === "CONVERSATION" && quest.conversationEncounter) ||
    (quest.type === "SPEECH" && quest.speechEncounter)
  ) {
    return null
  }

  const updated = progressQuestObjective(quest, objectiveId)
  store.updateQuest(updated)
  await updateUserQuest(userId, updated)
  await persistState()
  return updated
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

  const result = submitVocabularyAnswer(quest, answer, userId)
  store.updateQuest(result.quest)
  await updateUserQuest(userId, result.quest)

  if (result.masteryUpdate) {
    try {
      await upsertWordMastery(userId, result.masteryUpdate)
    } catch {
      /* mastery persists on next successful save when DB available */
    }
  }

  if (result.encounterFailed) {
    await failQuestForPlayer(userId, questId)
    return {
      correct: false,
      encounterFailed: true,
      encounterComplete: false,
    }
  }

  await persistState()
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

  await persistState()
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

  const result = applySpeechAnalysis(quest, analysis)
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

  await persistState()
  return {
    passed: result.passed,
    encounterFailed: false,
    encounterComplete: result.encounterComplete,
    feedback: analysis.feedback,
    compositeScore: analysis.compositeScore,
  }
}

export async function failQuestForPlayer(userId: string, questId: string) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const player = store.player
  if (!quest || !player) return null

  const failResult = failQuest(quest, player.penalties, userId)
  store.applyPenalties(failResult.penalties)

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  await failUserQuest(userId, questId)
  await persistState()

  return failResult
}

export async function finishQuest(userId: string, questId: string) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const progressionState = store.getProgressionState()
  if (!quest || !progressionState || !store.player) return null

  const result = completeQuest(quest, progressionState, userId)
  if (!result.progression) return null

  store.applyProgressionUpdate({
    xp: result.progression.xp,
    level: result.progression.level,
    rank: result.progression.rank,
    progression: result.progression.progression,
    penalties: result.progression.penalties,
    leveledUp: result.progression.leveledUp,
  })

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await completeUserQuest(userId, questId)
  await triggerSave({ player, activeQuests: remaining })

  return result
}
