import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import {
  canUnlockBeat,
  resolveStoryProgress,
} from "@/systems/narrative/storyProgressSystem"

export function isQuestUnlocked(
  quest: QuestContract,
  completedIds: string[],
  player?: PlayerContract
): boolean {
  const meta = getQuestCatalogMeta(quest)
  const prerequisiteQuest = meta.prerequisiteQuestId
  if (prerequisiteQuest && !completedIds.includes(prerequisiteQuest)) {
    return false
  }

  const prerequisiteBeat =
    quest.prerequisiteBeatId ??
    (meta as { prerequisiteBeatId?: string }).prerequisiteBeatId
  if (prerequisiteBeat && player) {
    const progress = resolveStoryProgress(player)
    if (!canUnlockBeat(progress, prerequisiteBeat)) {
      return false
    }
  }

  return true
}
