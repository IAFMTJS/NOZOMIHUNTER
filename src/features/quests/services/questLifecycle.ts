import { failUserQuest, updateUserQuest } from "@/services/supabase/playerRepository"
import { completeQuestGuarded } from "@/services/supabase/progressionRepository"
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
import { applyFatigueRecoveryOnComplete } from "@/systems/penalties/penaltyGameplaySystem"
import { markTutorialComplete } from "@/systems/tutorial/tutorialSystem"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import { shouldAssignTutorialQuest } from "@/systems/tutorial/tutorialSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { triggerSave } from "@/systems/save/saveSystem"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { eventBus } from "@/systems/events/eventBus"
import {
  emitUnlockGrants,
  resolveRewardProgression,
} from "@/systems/progression/resolveQuestCompletion"
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

  const rewardPayload = calculateQuestReward(
    quest.rewards,
    fatigueXpMultiplier(progressionState.penalties.fatigue)
  )

  const server = await completeQuestGuarded(quest.id, rewardPayload.xp)

  const { progression: mergedProgression, newUnlocks } =
    resolveRewardProgression(progressionState.progression, quest.rewards)

  let progression = mergedProgression
  if (quest.isTutorial) {
    progression = markTutorialComplete(progression)
  }

  const leveledUp = server.level > server.previous_level
  const rankUp = server.rank !== progressionState.rank

  store.applyProgressionUpdate({
    xp: server.xp,
    level: server.level,
    rank: server.rank,
    progression,
    penalties: applyFatigueRecoveryOnComplete({
      ...progressionState.penalties,
      xpDebt: Math.max(
        0,
        progressionState.penalties.xpDebt - server.xp_gained
      ),
    }),
    leveledUp,
    rankUp,
    newUnlocks,
  })

  emitUnlockGrants(userId, newUnlocks)

  eventBus.emit(GAME_EVENTS.QUEST_COMPLETED, { playerId: userId, questId })
  eventBus.emit(GAME_EVENTS.XP_GAINED, {
    playerId: userId,
    xpGained: server.xp_gained,
    totalXp: server.xp,
  })
  if (leveledUp) {
    eventBus.emit(GAME_EVENTS.LEVEL_UP, {
      playerId: userId,
      level: server.level,
      previousLevel: server.previous_level,
    })
  }
  if (rankUp) {
    eventBus.emit(GAME_EVENTS.RANK_UP, { playerId: userId, rank: server.rank })
  }

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
      progression,
      xpGained: server.xp_gained,
      leveledUp,
      rankUp,
    },
  }
}
