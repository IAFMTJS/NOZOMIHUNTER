import type { InventorySlotContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { SHOP_ITEM_EFFECTS } from "@/config/shopItemEffects"

export type RelicEffectType =
  | "xp_bonus"
  | "corruption_reduction"
  | "accuracy_bonus"
  | "crit_bonus"

export interface RelicEffectContract {
  effectType: RelicEffectType
  value: number
  sourceItemKey: string
}

const RELIC_EFFECT_MAP: Record<string, RelicEffectContract> = {
  "item:focus-lens": { effectType: "accuracy_bonus", value: 5, sourceItemKey: "item:focus-lens" },
  "item:memory-core": { effectType: "xp_bonus", value: 10, sourceItemKey: "item:memory-core" },
  "item:void-seal": {
    effectType: "corruption_reduction",
    value: 15,
    sourceItemKey: "item:void-seal",
  },
}

export function relicEffectsFromInventory(
  inventory: InventorySlotContract[]
): RelicEffectContract[] {
  const effects: RelicEffectContract[] = []
  for (const slot of inventory) {
    if (!slot.equipped || slot.quantity < 1) continue
    const mapped = RELIC_EFFECT_MAP[slot.itemKey]
    if (mapped) effects.push(mapped)
    const shop = SHOP_ITEM_EFFECTS[slot.itemKey]
    if (shop?.xpMultiplier && shop.xpMultiplier > 1) {
      effects.push({
        effectType: "xp_bonus",
        value: Math.round((shop.xpMultiplier - 1) * 100),
        sourceItemKey: slot.itemKey,
      })
    }
  }
  return effects
}

export function aggregateRelicModifiers(player: PlayerContract): {
  xpBonusPercent: number
  corruptionReductionPercent: number
  accuracyBonusPercent: number
} {
  const effects = relicEffectsFromInventory(player.inventory)
  let xpBonusPercent = 0
  let corruptionReductionPercent = 0
  let accuracyBonusPercent = 0
  for (const e of effects) {
    switch (e.effectType) {
      case "xp_bonus":
        xpBonusPercent += e.value
        break
      case "corruption_reduction":
        corruptionReductionPercent += e.value
        break
      case "accuracy_bonus":
        accuracyBonusPercent += e.value
        break
      default:
        break
    }
  }
  return { xpBonusPercent, corruptionReductionPercent, accuracyBonusPercent }
}

export const MAX_RELIC_SLOTS = 3
