import { purchaseItemGuarded } from "@/services/supabase/economyRepository"
import {
  loadItemCatalog,
  loadPlayerInventory,
  setItemEquipped,
} from "@/services/supabase/inventoryRepository"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export async function purchaseShopItem(
  userId: string,
  itemKey: string,
  quantity: number
): Promise<void> {
  const result = await purchaseItemGuarded(itemKey, quantity)
  eventBus.emit(GAME_EVENTS.ITEM_GRANTED, {
    playerId: userId,
    itemKey,
    quantity,
  })
  const inventory = await loadPlayerInventory(userId)
  const store = usePlayerStore.getState()
  const player = store.player
  if (player) {
    store.setPlayer({
      ...player,
      economy: { ...player.economy, credits: result.credits },
      inventory,
    })
  }
  await hydratePlayerFromDb(userId)
}

export async function toggleItemEquipped(
  userId: string,
  itemKey: string,
  catalog: ItemCatalogEntryContract[]
): Promise<void> {
  const entry = catalog.find((c) => c.key === itemKey)
  if (!entry || entry.category !== "EQUIPMENT") {
    throw new Error("Only equipment can be equipped")
  }

  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return

  const slot = player.inventory.find((s) => s.itemKey === itemKey)
  if (!slot || slot.quantity < 1) {
    throw new Error("Item not in loadout")
  }

  const nextEquipped = !slot.equipped

  if (nextEquipped) {
    for (const other of player.inventory) {
      const otherEntry = catalog.find((c) => c.key === other.itemKey)
      if (otherEntry?.category === "EQUIPMENT" && other.equipped) {
        await setItemEquipped(userId, other.itemKey, false)
      }
    }
  }

  await setItemEquipped(userId, itemKey, nextEquipped)
  await hydratePlayerFromDb(userId)
}

export async function fetchItemCatalog(): Promise<ItemCatalogEntryContract[]> {
  return loadItemCatalog()
}
