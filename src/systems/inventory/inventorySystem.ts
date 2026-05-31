import type {
  InventorySlotContract,
  ItemCatalogEntryContract,
  ItemCategory,
} from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { INVENTORY_CONFIG } from "@/config/inventoryConfig"

function categoryMap(
  catalog?: ItemCatalogEntryContract[]
): Map<string, ItemCategory> | undefined {
  if (!catalog?.length) return undefined
  return new Map(catalog.map((c) => [c.key, c.category]))
}

function slotCategory(
  itemKey: string,
  map?: Map<string, ItemCategory>
): ItemCategory | undefined {
  return map?.get(itemKey)
}

function isConsumableSlot(
  slot: InventorySlotContract,
  map?: Map<string, ItemCategory>
): boolean {
  if (slot.quantity <= 0) return false
  const cat = slotCategory(slot.itemKey, map)
  if (cat) return cat === "CONSUMABLE"
  return (
    slot.itemKey.includes("draft") ||
    slot.itemKey.includes("cache") ||
    slot.itemKey.includes("potion")
  )
}

export function inventoryUsed(slots: InventorySlotContract[]): number {
  return slots.reduce((sum, s) => sum + s.quantity, 0)
}

export function inventoryCapacityRemaining(slots: InventorySlotContract[]): number {
  return Math.max(0, INVENTORY_CONFIG.CAPACITY - inventoryUsed(slots))
}

export function countEquippedItems(slots: InventorySlotContract[]): number {
  return slots.filter((s) => s.equipped).length
}

export function hasConsumables(
  slots: InventorySlotContract[],
  catalog?: ItemCatalogEntryContract[]
): boolean {
  const map = categoryMap(catalog)
  return slots.some((s) => isConsumableSlot(s, map))
}

export function hasEquipmentReady(
  slots: InventorySlotContract[],
  catalog?: ItemCatalogEntryContract[]
): boolean {
  if (countEquippedItems(slots) > 0) return true
  const map = categoryMap(catalog)
  return slots.some((s) => {
    if (s.quantity <= 0) return false
    const cat = slotCategory(s.itemKey, map)
    if (cat) return cat === "EQUIPMENT"
    return s.itemKey.includes("blade") || s.itemKey.includes("ring")
  })
}

export function mergeInventoryGrant(
  current: InventorySlotContract[],
  itemKey: string,
  quantity: number
): InventorySlotContract[] {
  const existing = current.find((s) => s.itemKey === itemKey)
  if (existing) {
    return current.map((s) =>
      s.itemKey === itemKey ? { ...s, quantity: s.quantity + quantity } : s
    )
  }
  return [...current, { itemKey, quantity, equipped: false }]
}

export function applyInventoryToPlayer(
  player: PlayerContract,
  slots: InventorySlotContract[],
): PlayerContract {
  return { ...player, inventory: slots, updatedAt: new Date().toISOString() }
}

/** Lose one consumable on catastrophic failure (local inventory only). */
export function loseFirstConsumable(
  slots: InventorySlotContract[],
  catalog?: ItemCatalogEntryContract[]
): { slots: InventorySlotContract[]; lostItemKey: string | null } {
  const map = categoryMap(catalog)
  const target = slots.find((s) => isConsumableSlot(s, map))
  if (!target) return { slots, lostItemKey: null }
  const next = slots
    .map((s) =>
      s.itemKey === target.itemKey ? { ...s, quantity: Math.max(0, s.quantity - 1) } : s
    )
    .filter((s) => s.quantity > 0)
  return { slots: next, lostItemKey: target.itemKey }
}
