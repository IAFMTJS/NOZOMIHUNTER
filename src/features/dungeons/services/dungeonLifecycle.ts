import { failUserQuest, updateUserQuest } from "@/services/supabase/playerRepository"
import { completeQuestGuarded } from "@/services/supabase/progressionRepository"
import { acceptQuest } from "@/systems/quests/questOrchestrator"
import { calculateQuestReward } from "@/systems/progression/rewardSystem"
import { fatigueXpMultiplier } from "@/systems/penalties/penaltySystem"
import { applyFatigueRecoveryOnComplete } from "@/systems/penalties/penaltyGameplaySystem"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import { generateDungeonQuest } from "@/systems/dungeons/dungeonQuestGenerator"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import {
  beginDungeonSector,
  continueAfterReward,
  deployDungeon,
  failDungeonRun,
  finalizeDungeonExtraction,
} from "@/systems/dungeons/dungeonOrchestrator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import {
  emitUnlockGrants,
  resolveRewardProgression,
} from "@/systems/progression/resolveQuestCompletion"
import { triggerSave } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import {
  assignQuest,
  dedupeActiveQuests,
  ensureDungeonSaveHandler,
  getDungeonQuest,
  persistDungeonQuest,
  persistDungeonState,
} from "./dungeonPersistence"

export async function enterDungeon(userId: string, dungeonKey: string) {
  ensureDungeonSaveHandler()
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
  await persistDungeonState()
  return quest
}

export async function deployDungeonRun(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null
  const updated = deployDungeon(quest, userId)
  await persistDungeonQuest(userId, updated)
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
      await persistDungeonQuest(userId, updated)
      return updated
    }
  }

  const updated = beginDungeonSector(quest)
  eventBus.emit(GAME_EVENTS.ENCOUNTER_STARTED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: updated.dungeonRun?.activeType,
  })
  await persistDungeonQuest(userId, updated)
  return updated
}

export async function abandonDungeon(userId: string) {
  const { quest, store, player } = getDungeonQuest()
  if (!quest || !player) return null

  const failResult = failDungeonRun(quest, player.penalties, userId)
  store.applyPenalties(failResult.penalties)
  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)
  await failUserQuest(userId, quest.id)
  await persistDungeonState()
  return failResult
}

export async function extractDungeonRewards(userId: string) {
  const { quest, store } = getDungeonQuest()
  const progressionState = store.getProgressionState()
  if (!quest?.dungeonRun || !progressionState || !store.player) return null

  const ready = finalizeDungeonExtraction(quest)
  if (!canCompleteQuest(ready)) {
    throw new Error("Dungeon objectives not complete")
  }

  await updateUserQuest(userId, ready)

  const rewardPayload = calculateQuestReward(
    ready.rewards,
    fatigueXpMultiplier(progressionState.penalties.fatigue)
  )

  const server = await completeQuestGuarded(ready.id, rewardPayload.xp)
  const leveledUp = server.level > server.previous_level
  const rankUp = server.rank !== progressionState.rank

  const { progression, newUnlocks } = resolveRewardProgression(
    progressionState.progression,
    ready.rewards
  )

  eventBus.emit(GAME_EVENTS.DUNGEON_COMPLETED, {
    playerId: userId,
    dungeonId: quest.dungeonRun.dungeon.id,
    xp: server.xp_gained,
  })

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

  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await triggerSave({ player, activeQuests: remaining })

  return {
    quest: ready,
    progression: {
      xp: server.xp,
      level: server.level,
      rank: server.rank,
      penalties: player.penalties,
      progression: player.progression,
      xpGained: server.xp_gained,
      leveledUp,
      rankUp,
    },
  }
}
