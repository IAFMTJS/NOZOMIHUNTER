import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { PreparationChecklistContract } from "@/contracts/readiness-contract"
import {
  hasConsumables,
  hasEquipmentReady,
} from "@/systems/inventory/inventorySystem"

export function computePreparationChecklist(
  player: PlayerContract,
  vocabularyReady: boolean,
  catalog?: ItemCatalogEntryContract[]
): PreparationChecklistContract {
  return {
    equipment: hasEquipmentReady(player.inventory, catalog),
    skillLoadout: player.stats.speaking >= 1 || player.stats.listening >= 1,
    consumables: hasConsumables(player.inventory, catalog),
    vocabulary: vocabularyReady,
  }
}

export function checklistComplete(checklist: PreparationChecklistContract): boolean {
  return (
    checklist.equipment &&
    checklist.skillLoadout &&
    checklist.consumables &&
    checklist.vocabulary
  )
}
