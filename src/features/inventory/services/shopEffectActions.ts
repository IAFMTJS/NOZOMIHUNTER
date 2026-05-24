import { consumeActiveBoost } from "@/features/inventory/services/inventoryActions"
import {
  retryMostRecentFailedQuest,
  skipQuestObjectiveForPlayer,
} from "@/features/quests/services/questLifecycle"
import { freezeDungeonTimer } from "@/features/dungeons/services/dungeonLifecycle"
import type { BoostEffectType } from "@/contracts/economy-contract"

export { consumeActiveBoost }

export async function retryMostRecentFailedContract(userId: string) {
  return retryMostRecentFailedQuest(userId)
}

export async function skipQuestObjective(userId: string, questId: string) {
  return skipQuestObjectiveForPlayer(userId, questId)
}

export { freezeDungeonTimer }

export async function consumeShopBoost(
  userId: string,
  effectType: BoostEffectType
): Promise<void> {
  await consumeActiveBoost(userId, effectType)
}
