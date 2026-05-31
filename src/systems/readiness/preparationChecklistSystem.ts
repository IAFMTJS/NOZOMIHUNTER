import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { PreparationChecklistContract } from "@/contracts/readiness-contract"
import {
  hasConsumables,
  hasEquipmentReady,
} from "@/systems/inventory/inventorySystem"
import { isTutorialComplete } from "@/systems/tutorial/tutorialSystem"

function isBootstrapPlayer(player: PlayerContract): boolean {
  return player.level <= 1 && !isTutorialComplete(player)
}

function skillLoadoutReady(player: PlayerContract): boolean {
  if (player.level >= 2 || isTutorialComplete(player)) return true
  const { vocabulary, listening, speaking, grammar } = player.stats
  return (
    vocabulary >= 1 ||
    listening >= 1 ||
    speaking >= 1 ||
    grammar >= 1
  )
}

export function computePreparationChecklist(
  player: PlayerContract,
  vocabularyReady: boolean,
  catalog?: ItemCatalogEntryContract[] | undefined,
  operationalReadinessReady = true
): PreparationChecklistContract {
  const bootstrap = isBootstrapPlayer(player)
  return {
    equipment: bootstrap ? true : hasEquipmentReady(player.inventory, catalog),
    skillLoadout: skillLoadoutReady(player),
    consumables: bootstrap ? true : hasConsumables(player.inventory, catalog),
    vocabulary: vocabularyReady,
    operationalReadiness: operationalReadinessReady,
  }
}

export function checklistComplete(checklist: PreparationChecklistContract): boolean {
  return (
    checklist.equipment &&
    checklist.skillLoadout &&
    checklist.consumables &&
    checklist.vocabulary &&
    checklist.operationalReadiness
  )
}
