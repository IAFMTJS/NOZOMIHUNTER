import type { PlayerContract } from "@/contracts/player-contract"
import type { InventorySlotContract } from "@/contracts/economy-contract"
import { defaultProgression, mergeUnlocks } from "@/systems/progression/unlockSystem"
import { INVENTORY_CONFIG } from "@/config/inventoryConfig"

const BOOTSTRAP_UNLOCK = "bootstrap:starter-pack"

export function normalizePlayerProgression(
  progression: PlayerContract["progression"]
): PlayerContract["progression"] {
  const defaults = defaultProgression()
  const dungeons =
    progression.unlockedDungeons.length > 0
      ? progression.unlockedDungeons
      : defaults.unlockedDungeons
  return {
    ...progression,
    unlockedDungeons: dungeons,
    unlockedSystems: [
      ...new Set([
        ...defaults.unlockedSystems,
        ...progression.unlockedSystems,
      ]),
    ],
  }
}

export function needsStarterInventory(
  player: PlayerContract,
  inventory: InventorySlotContract[]
): boolean {
  if (inventory.length > 0) return false
  return !player.progression.unlockedSystems.includes(BOOTSTRAP_UNLOCK)
}

export function applyStarterInventoryToPlayer(
  player: PlayerContract
): { player: PlayerContract; inventory: InventorySlotContract[] } {
  const inventory: InventorySlotContract[] = INVENTORY_CONFIG.STARTER_ITEMS.map(
    (item) => ({
      itemKey: item.itemKey,
      quantity: item.quantity,
      equipped: item.itemKey === "hunter-blade",
    })
  )
  const progression = mergeUnlocks(player.progression, [BOOTSTRAP_UNLOCK])
  return { player: { ...player, progression }, inventory }
}

export function bootstrapPlayerState(
  player: PlayerContract,
  inventory: InventorySlotContract[]
): { player: PlayerContract; inventory: InventorySlotContract[]; changed: boolean } {
  let nextPlayer = {
    ...player,
    progression: normalizePlayerProgression(player.progression),
  }
  let nextInventory = inventory
  let changed =
    nextPlayer.progression.unlockedDungeons.join() !==
    player.progression.unlockedDungeons.join()

  if (needsStarterInventory(nextPlayer, nextInventory)) {
    const packed = applyStarterInventoryToPlayer(nextPlayer)
    nextPlayer = packed.player
    nextInventory = packed.inventory
    changed = true
  }

  return { player: nextPlayer, inventory: nextInventory, changed }
}
