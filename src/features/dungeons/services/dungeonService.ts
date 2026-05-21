import {
  assignQuest,
  updateUserQuest,
  failUserQuest,
  completeUserQuest,
} from "@/services/supabase/playerRepository"
import { acceptQuest, completeQuest } from "@/systems/quests/questOrchestrator"
import { submitVocabularyAnswer } from "@/systems/quests/vocabularyEncounterSystem"
import { submitConversationMessage } from "@/systems/quests/conversationEncounterSystem"
import { applySpeechAnalysis, getCurrentPhrase } from "@/systems/quests/speechEncounterSystem"
import { submitListeningAnswer } from "@/systems/dungeons/listeningEncounterSystem"
import { generateDungeonQuest } from "@/systems/dungeons/dungeonQuestGenerator"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import {
  advanceBossPhase,
  beginDungeonSector,
  completeDungeonSector,
  continueAfterReward,
  deployDungeon,
  failDungeonRun,
  finalizeDungeonExtraction,
  registerEncounterFailure,
  shouldFailDungeon,
} from "@/systems/dungeons/dungeonOrchestrator"
import {
  clearEncounterPayloads,
} from "@/systems/dungeons/dungeonEncounterFactory"
import { transition } from "@/systems/dungeons/dungeonStateMachine"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { triggerSave, registerSaveHandler } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import {
  loadPlayerAiState,
  savePlayerAiState,
} from "@/services/supabase/conversationRepository"
import { transcribeAndAnalyze } from "@/services/speech/transcribe"
import { upsertWordMastery } from "@/services/supabase/vocabularyRepository"
import { savePlayer } from "@/services/supabase/playerRepository"

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

function getDungeonQuest() {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.type === "DUNGEON" && q.dungeonRun)
  return { store, quest, player: store.player }
}

async function persistQuest(userId: string, quest: NonNullable<ReturnType<typeof getDungeonQuest>["quest"]>) {
  const store = usePlayerStore.getState()
  store.updateQuest(quest)
  await updateUserQuest(userId, quest)
  await persistState()
}

async function handleDungeonFailure(
  userId: string,
  quest: NonNullable<ReturnType<typeof getDungeonQuest>["quest"]>
) {
  const { store, player } = getDungeonQuest()
  if (!player) return

  const withFailure = registerEncounterFailure(quest)
  if (shouldFailDungeon(withFailure)) {
    const failResult = failDungeonRun(withFailure, player.penalties, userId)
    store.applyPenalties(failResult.penalties)
    const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
    store.setQuests(remaining)
    await failUserQuest(userId, quest.id)
    await persistState()
    return
  }

  const run = withFailure.dungeonRun!
  const retry = {
    ...withFailure,
    ...clearEncounterPayloads(),
    dungeonRun: {
      ...run,
      machineState: transition(run.machineState, "EXPLORATION"),
      activeType: null,
    },
  }
  await persistQuest(userId, retry)
}

async function onSectorCleared(userId: string, quest: NonNullable<ReturnType<typeof getDungeonQuest>["quest"]>) {
  const run = quest.dungeonRun!
  eventBus.emit(GAME_EVENTS.ENCOUNTER_COMPLETED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: run.activeType,
  })

  if (run.activeType === "BOSS") {
    const updated = advanceBossPhase(quest)
    if (updated.dungeonRun?.machineState === "EXTRACTION") {
      await persistQuest(userId, updated)
      return { quest: updated, phase: "extraction" as const }
    }
    await persistQuest(userId, updated)
    return { quest: updated, phase: "boss_continue" as const }
  }

  const updated = completeDungeonSector(quest)
  await persistQuest(userId, updated)
  return { quest: updated, phase: "reward" as const }
}

export async function enterDungeon(userId: string, dungeonKey: string) {
  ensureSaveHandler()
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const gate = canStartDungeon(player, store.activeQuests, dungeonKey)
  if (!gate.ok) {
    throw new Error(gate.reason ?? "Cannot enter dungeon")
  }

  const quest = generateDungeonQuest(player.level, dungeonKey)
  acceptQuest(quest, userId)
  await assignQuest(userId, quest)
  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistState()
  return quest
}

export async function deployDungeonRun(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null
  const updated = deployDungeon(quest, userId)
  await persistQuest(userId, updated)
  return updated
}

export async function startDungeonSector(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null

  const run = quest.dungeonRun!
  if (run.machineState === "EXPLORATION" || run.machineState === "REWARD") {
    if (run.machineState === "REWARD") {
      const continued = continueAfterReward(quest)
      const updated = beginDungeonSector(continued)
      eventBus.emit(GAME_EVENTS.ENCOUNTER_STARTED, {
        playerId: userId,
        dungeonId: run.dungeon.id,
        encounterType: updated.dungeonRun?.activeType,
      })
      await persistQuest(userId, updated)
      return updated
    }
  }

  const updated = beginDungeonSector(quest)
  eventBus.emit(GAME_EVENTS.ENCOUNTER_STARTED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: updated.dungeonRun?.activeType,
  })
  await persistQuest(userId, updated)
  return updated
}

export async function submitDungeonVocabulary(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  const { quest, player } = getDungeonQuest()
  if (!quest?.vocabularyEncounter || !player) return null

  const result = submitVocabularyAnswer(quest, answer, userId)
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

  await persistQuest(userId, result.quest)
  return { correct: result.correct, encounterFailed: false }
}

export async function submitDungeonListening(
  userId: string,
  answer: string
): Promise<{ correct: boolean; encounterFailed: boolean } | null> {
  const { quest, player } = getDungeonQuest()
  if (!quest?.listeningEncounter || !player) return null

  const result = submitListeningAnswer(quest, answer)

  if (result.encounterFailed) {
    await handleDungeonFailure(userId, result.quest)
    return { correct: false, encounterFailed: true }
  }

  if (result.encounterComplete) {
    await onSectorCleared(userId, result.quest)
    return { correct: true, encounterFailed: false }
  }

  await persistQuest(userId, result.quest)
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

  await persistQuest(userId, result.quest)
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

  const result = applySpeechAnalysis(quest, analysis)

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
    const run = quest.dungeonRun!
    if (run.activeType === "BOSS") {
      await onSectorCleared(userId, result.quest)
    } else {
      await onSectorCleared(userId, result.quest)
    }
    return {
      passed: true,
      encounterFailed: false,
      feedback: analysis.feedback,
      compositeScore: analysis.compositeScore,
    }
  }

  await persistQuest(userId, result.quest)
  return {
    passed: result.passed,
    encounterFailed: false,
    feedback: analysis.feedback,
    compositeScore: analysis.compositeScore,
  }
}

export async function abandonDungeon(userId: string) {
  const { quest, store, player } = getDungeonQuest()
  if (!quest || !player) return null

  const failResult = failDungeonRun(quest, player.penalties, userId)
  store.applyPenalties(failResult.penalties)
  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)
  await failUserQuest(userId, quest.id)
  await persistState()
  return failResult
}

export async function extractDungeonRewards(userId: string) {
  const { quest, store } = getDungeonQuest()
  const progressionState = store.getProgressionState()
  if (!quest?.dungeonRun || !progressionState || !store.player) return null

  const ready = finalizeDungeonExtraction(quest)
  const result = completeQuest(ready, progressionState, userId)
  if (!result.progression) return null

  eventBus.emit(GAME_EVENTS.DUNGEON_COMPLETED, {
    playerId: userId,
    dungeonId: quest.dungeonRun.dungeon.id,
    xp: result.progression.xpGained,
  })

  store.applyProgressionUpdate({
    xp: result.progression.xp,
    level: result.progression.level,
    rank: result.progression.rank,
    progression: result.progression.progression,
    penalties: result.progression.penalties,
    leveledUp: result.progression.leveledUp,
  })

  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await completeUserQuest(userId, quest.id)
  await triggerSave({ player, activeQuests: remaining })

  return result
}
