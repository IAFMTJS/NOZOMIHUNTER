import type { QuestContract } from "@/contracts/quest-contract"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"

export function isQuestUnlocked(
  quest: QuestContract,
  completedIds: string[]
): boolean {
  const meta = getQuestCatalogMeta(quest)
  const prerequisite = meta.prerequisiteQuestId
  if (!prerequisite) return true
  return completedIds.includes(prerequisite)
}
