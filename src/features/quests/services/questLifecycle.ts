import { failUserQuest, updateUserQuest } from "@/services/supabase/playerRepository"
import { completeQuestGuarded } from "@/services/supabase/progressionRepository"
import {
  applyActivityCompletion,
  emitStandardCompletionEvents,
} from "@/features/rewards/services/completionService"
import {
  acceptQuest,
  failQuest,
  progressQuestObjective,
} from "@/systems/quests/questOrchestrator"
import { generateTutorialQuest } from "@/systems/quests/questGenerator"
import type { QuestRequestChannel } from "@/contracts/quest-contract"
import {
  generateQuestForChannel,
  meetsQuestRequirements,
} from "@/systems/quests/questChannelSystem"
import { assertVocabularyPoolAvailable } from "@/systems/quests/questVocabularyPoolGuard"
import { hasActiveBoost } from "@/systems/economy/boostSystem"
import {
  resetQuestForRetry,
  skipCurrentObjective,
} from "@/systems/economy/shopQuestEffectSystem"
import { consumeActiveBoost } from "@/features/inventory/services/inventoryActions"
import { reactivateFailedQuestGuarded } from "@/services/supabase/economyRepository"
import {
  loadMostRecentFailedQuest,
} from "@/services/supabase/playerRepository"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import { QuestSnapshotSchema } from "@/systems/validation/playerSchema"
import { logSystemEvent } from "@/systems/logger/logger"
import { shouldAssignTutorialQuest } from "@/systems/tutorial/tutorialSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { triggerSave } from "@/systems/save/saveSystem"
import { applyQuestRewardModifiers } from "@/systems/quests/questCompletionRewardSystem"
import {
  applyLiveModifiersToQuest,
  resolveLiveRewardModifiers,
} from "@/systems/live/liveEventModifierSystem"
import { resolveRewardProgression } from "@/systems/progression/resolveQuestCompletion"
import {
  assignQuest,
  dedupeActiveQuests,
  persistQuestState,
} from "./questPersistence"

const completingQuestIds = new Set<string>()

export async function ensureTutorialQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player || !shouldAssignTutorialQuest(player, store.activeQuests)) {
    return null
  }

  const generated = generateTutorialQuest(userId)
  const quest = acceptQuest(generated, userId)
  await assignQuest(userId, quest)

  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistQuestState()
  return quest
}

export async function requestNewQuest(
  userId: string,
  channel: QuestRequestChannel = "side"
) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const generated = generateQuestForChannel(
    channel,
    player,
    store.activeQuests
  )

  if (!meetsQuestRequirements(generated, player)) {
    throw new Error("Hunter level too low for this contract")
  }

  assertVocabularyPoolAvailable(generated)

  if (store.activeQuests.some((q) => q.id === generated.id)) {
    return store.activeQuests.find((q) => q.id === generated.id) ?? null
  }

  const quest = acceptQuest(generated, userId)
  await assignQuest(userId, quest)

  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistQuestState()

  return quest
}

export async function dismissQuestPreparationBriefing(
  userId: string,
  questId: string
) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest?.vocabularyPreparation) return null

  const updated = {
    ...quest,
    vocabularyPreparation: {
      ...quest.vocabularyPreparation,
      briefingDismissed: true,
    },
  }

  store.updateQuest(updated)
  await updateUserQuest(userId, updated)
  await persistQuestState()
  return updated
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
    (quest.type === "SPEECH" && quest.speechEncounter) ||
    (quest.type === "LISTENING" && quest.listeningEncounter)
  ) {
    return null
  }

  const updated = progressQuestObjective(quest, objectiveId)
  store.updateQuest(updated)
  await updateUserQuest(userId, updated)
  await persistQuestState()
  return updated
}

export async function failQuestForPlayer(userId: string, questId: string) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const player = store.player
  if (!quest || !player) return null

  const useRankShield = hasActiveBoost(player, "RANK_SHIELD")
  const failResult = failQuest(quest, player.penalties, userId, {
    suppressXpDebt: useRankShield,
  })
  store.applyPenalties(failResult.penalties)

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  await failUserQuest(userId, questId)
  if (useRankShield) {
    await consumeActiveBoost(userId, "RANK_SHIELD")
  }
  await persistQuestState()

  return failResult
}


export async function finishQuest(userId: string, questId: string) {
  if (completingQuestIds.has(questId)) return null
  completingQuestIds.add(questId)

  try {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const progressionState = store.getProgressionState()
  if (!quest || !progressionState || !store.player) return null

  if (!canCompleteQuest(quest)) {
    throw new Error("Quest objectives not complete")
  }

  const liveMods = resolveLiveRewardModifiers(userId)
  const questForComplete = applyLiveModifiersToQuest(
    applyQuestRewardModifiers(quest),
    liveMods
  )
  await updateUserQuest(userId, questForComplete)

  const snapshotCheck = QuestSnapshotSchema.safeParse(questForComplete)
  if (!snapshotCheck.success) {
    logSystemEvent("validation", "quest_snapshot_drift", snapshotCheck.error.flatten())
  }

  const server = await completeQuestGuarded(questForComplete.id, 0)

  const { progression: mergedProgression, newUnlocks } =
    resolveRewardProgression(progressionState.progression, quest.rewards)

  const { leveledUp, rankUp } = await applyActivityCompletion({
    userId,
    quest: questForComplete,
    server,
    progression: mergedProgression,
    newUnlocks,
    penaltiesBefore: progressionState.penalties,
    rankBefore: progressionState.rank,
  })

  emitStandardCompletionEvents(userId, questId, server, leveledUp, rankUp)

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await triggerSave({ player, activeQuests: remaining })

  return {
    quest: {
      ...quest,
      objectives: quest.objectives.map((o) => ({
        ...o,
        completed: true,
        currentProgress: o.requiredProgress,
      })),
    },
    progression: {
      xp: server.xp,
      level: server.level,
      rank: server.rank,
      penalties: usePlayerStore.getState().player!.penalties,
      progression: usePlayerStore.getState().player!.progression,
      xpGained: server.xp_gained,
      leveledUp,
      rankUp,
    },
  }
  } finally {
    completingQuestIds.delete(questId)
  }
}

export async function retryMostRecentFailedQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player || !hasActiveBoost(player, "QUEST_RETRY")) {
    throw new Error("Quest retry ticket not active")
  }

  const failed = await loadMostRecentFailedQuest(userId)
  if (!failed || failed.type === "DUNGEON") {
    throw new Error("No retryable failed contract")
  }

  const reset = resetQuestForRetry(failed)
  await reactivateFailedQuestGuarded(failed.id)
  await updateUserQuest(userId, reset)
  await consumeActiveBoost(userId, "QUEST_RETRY")

  store.setQuests(dedupeActiveQuests([...store.activeQuests, reset]))
  await persistQuestState()
  return reset
}

export async function skipQuestObjectiveForPlayer(
  userId: string,
  questId: string
) {
  const store = usePlayerStore.getState()
  const player = store.player
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!player || !quest) return null
  if (!hasActiveBoost(player, "SKIP_TOKEN")) {
    throw new Error("Skip token not active")
  }

  if (quest.type === "LISTENING" && quest.listeningEncounter) {
    throw new Error("Skip token cannot bypass listening calibration")
  }

  const updated = skipCurrentObjective(quest)
  await consumeActiveBoost(userId, "SKIP_TOKEN")
  store.updateQuest(updated)
  await updateUserQuest(userId, updated)
  await persistQuestState()
  return updated
}
