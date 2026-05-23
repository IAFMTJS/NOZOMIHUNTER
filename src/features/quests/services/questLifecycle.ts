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
import {
  generateQuestForPlayer,
  generateTutorialQuest,
} from "@/systems/quests/questGenerator"
import { calculateQuestReward } from "@/systems/progression/rewardSystem"
import { fatigueXpMultiplier } from "@/systems/penalties/penaltySystem"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import { QuestSnapshotSchema } from "@/systems/validation/playerSchema"
import { logSystemEvent } from "@/systems/logger/logger"
import { shouldAssignTutorialQuest } from "@/systems/tutorial/tutorialSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { triggerSave } from "@/systems/save/saveSystem"
import { resolveRewardProgression } from "@/systems/progression/resolveQuestCompletion"
import {
  assignQuest,
  dedupeActiveQuests,
  persistQuestState,
} from "./questPersistence"

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

export async function requestNewQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const generated = generateQuestForPlayer(
    player.level,
    player.progression.unlockedSystems
  )
  const quest = acceptQuest(generated, userId)
  await assignQuest(userId, quest)

  if (store.activeQuests.some((q) => q.id === quest.id)) {
    return quest
  }

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
    (quest.type === "SPEECH" && quest.speechEncounter)
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

  const failResult = failQuest(quest, player.penalties, userId)
  store.applyPenalties(failResult.penalties)

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  await failUserQuest(userId, questId)
  await persistQuestState()

  return failResult
}

export async function finishQuest(userId: string, questId: string) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const progressionState = store.getProgressionState()
  if (!quest || !progressionState || !store.player) return null

  if (!canCompleteQuest(quest)) {
    throw new Error("Quest objectives not complete")
  }

  await updateUserQuest(userId, quest)

  const snapshotCheck = QuestSnapshotSchema.safeParse(quest)
  if (!snapshotCheck.success) {
    logSystemEvent("validation", "quest_snapshot_drift", snapshotCheck.error.flatten())
  }

  const rewardPayload = calculateQuestReward(
    quest.rewards,
    fatigueXpMultiplier(progressionState.penalties.fatigue)
  )

  const server = await completeQuestGuarded(quest.id, rewardPayload.xp)

  const { progression: mergedProgression, newUnlocks } =
    resolveRewardProgression(progressionState.progression, quest.rewards)

  const { leveledUp, rankUp } = await applyActivityCompletion({
    userId,
    quest,
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
}
