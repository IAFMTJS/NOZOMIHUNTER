import {
  convertXpToCreditsGuarded,
  consumeActiveBoostGuarded,
  purchaseItemGuarded,
  sellItemGuarded,
  consumeItemGuarded,
} from "@/services/supabase/economyRepository"
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
import { parseActiveBoosts } from "@/systems/economy/xpConversionSystem"
import { getItemEffect } from "@/config/shopItemEffects"
import type { BoostEffectType } from "@/contracts/economy-contract"
import { consumeBoostUse } from "@/systems/economy/boostSystem"

export async function sellInventoryItem(
  userId: string,
  itemKey: string,
  quantity: number
): Promise<void> {
  const result = await sellItemGuarded(itemKey, quantity)
  eventBus.emit(GAME_EVENTS.SHOP_ITEM_SOLD, {
    playerId: userId,
    itemKey,
    quantity,
    gained: result.gained,
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

export async function purchaseShopItem(
  userId: string,
  itemKey: string,
  quantity: number
): Promise<void> {
  const result = await purchaseItemGuarded(itemKey, quantity)
  eventBus.emit(GAME_EVENTS.SHOP_PURCHASED, {
    playerId: userId,
    itemKey,
    quantity,
    spent: result.spent,
  })
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

export async function convertXpToCredits(
  userId: string,
  xpAmount: number
): Promise<void> {
  const result = await convertXpToCreditsGuarded(xpAmount)
  const store = usePlayerStore.getState()
  const player = store.player
  if (player) {
    store.setPlayer({
      ...player,
      xp: result.xp,
      economy: {
        ...player.economy,
        credits: result.credits,
        xpConversionCount:
          player.economy.xpConversionDate === new Date().toISOString().slice(0, 10)
            ? player.economy.xpConversionCount + 1
            : 1,
        xpConversionDate: new Date().toISOString().slice(0, 10),
      },
    })
  }
  eventBus.emit(GAME_EVENTS.XP_CONVERTED, {
    playerId: userId,
    xpSpent: result.xpSpent,
    creditsGained: result.creditsGained,
  })
  await hydratePlayerFromDb(userId)
}

export async function activateConsumable(
  userId: string,
  itemKey: string
): Promise<void> {
  const effect = getItemEffect(itemKey)
  if (!effect) {
    throw new Error("Item cannot be activated")
  }

  const result = await consumeItemGuarded(itemKey)
  const inventory = await loadPlayerInventory(userId)
  const store = usePlayerStore.getState()
  const player = store.player
  if (player) {
    store.setPlayer({
      ...player,
      inventory,
      economy: {
        ...player.economy,
        activeBoosts: parseActiveBoosts(result.activeBoosts),
      },
    })
  }
  eventBus.emit(GAME_EVENTS.BOOST_ACTIVATED, {
    playerId: userId,
    itemKey,
    effectType: effect.effectType,
  })
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

export async function consumeActiveBoost(
  userId: string,
  effectType: BoostEffectType
): Promise<void> {
  await consumeActiveBoostGuarded(effectType)
  const store = usePlayerStore.getState()
  const player = store.player
  if (player) {
    const next = consumeBoostUse(player.economy.activeBoosts, effectType)
    store.setPlayer({
      ...player,
      economy: { ...player.economy, activeBoosts: next },
    })
  }
  await hydratePlayerFromDb(userId)
}
