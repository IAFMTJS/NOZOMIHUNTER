import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"

export function setTrackedQuest(
  player: PlayerContract,
  questId: string | null
): PlayerContract {
  return {
    ...player,
    trackedQuestId: questId,
    updatedAt: new Date().toISOString(),
  }
}

export function getTrackedQuest(
  quests: QuestContract[],
  player: PlayerContract
): QuestContract | undefined {
  if (!player.trackedQuestId) return undefined
  return quests.find((q) => q.id === player.trackedQuestId)
}

export function isQuestTracked(player: PlayerContract, questId: string): boolean {
  return player.trackedQuestId === questId
}
