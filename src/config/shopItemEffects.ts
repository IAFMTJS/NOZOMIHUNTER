import type { BoostEffectType } from "@/contracts/economy-contract"

export interface ShopItemEffectDefinition {
  effectType: BoostEffectType
  durationMs: number | null
  uses: number | null
  xpMultiplier?: number
  statBonus?: number
  titleKey?: string
  auraKey?: string
}

/** Effect metadata keyed by item catalog key */
export const SHOP_ITEM_EFFECTS: Record<string, ShopItemEffectDefinition> = {
  "unlimited-mistakes": {
    effectType: "MISTAKE_SHIELD",
    durationMs: 15 * 60 * 1000,
    uses: null,
  },
  "xp-booster-small": {
    effectType: "XP_BOOST",
    durationMs: 15 * 60 * 1000,
    uses: null,
    xpMultiplier: 1.25,
  },
  "xp-booster-major": {
    effectType: "XP_BOOST",
    durationMs: 30 * 60 * 1000,
    uses: null,
    xpMultiplier: 1.5,
  },
  "xp-booster-insane": {
    effectType: "XP_BOOST",
    durationMs: 15 * 60 * 1000,
    uses: null,
    xpMultiplier: 2,
  },
  "stat-buffer-int": {
    effectType: "STAT_BUFFER",
    durationMs: 20 * 60 * 1000,
    uses: null,
    statBonus: 5,
  },
  "stat-buffer-focus": {
    effectType: "STAT_BUFFER",
    durationMs: 20 * 60 * 1000,
    uses: null,
    statBonus: 5,
  },
  "rank-shield": {
    effectType: "RANK_SHIELD",
    durationMs: null,
    uses: 1,
  },
  "system-breach": {
    effectType: "DIFFICULTY_OVERRIDE",
    durationMs: null,
    uses: 1,
  },
  "reward-amplifier": {
    effectType: "REWARD_AMPLIFIER",
    durationMs: null,
    uses: 1,
  },
  "quest-retry-ticket": {
    effectType: "QUEST_RETRY",
    durationMs: null,
    uses: 1,
  },
  "skip-token": {
    effectType: "SKIP_TOKEN",
    durationMs: null,
    uses: 1,
  },
  "revive-token": {
    effectType: "REVIVE_TOKEN",
    durationMs: null,
    uses: 1,
  },
  "escape-beacon": {
    effectType: "ESCAPE_BEACON",
    durationMs: null,
    uses: 1,
  },
  "time-freeze": {
    effectType: "TIME_FREEZE",
    durationMs: null,
    uses: 1,
  },
  "aura-shadow": {
    effectType: "COSMETIC_AURA",
    durationMs: null,
    uses: null,
    auraKey: "shadow",
  },
  "aura-divine": {
    effectType: "COSMETIC_AURA",
    durationMs: null,
    uses: null,
    auraKey: "divine",
  },
  "title-unbroken": {
    effectType: "TITLE_UNLOCK",
    durationMs: null,
    uses: 1,
    titleKey: "title:the-unbroken",
  },
}

export function getItemEffect(itemKey: string): ShopItemEffectDefinition | null {
  return SHOP_ITEM_EFFECTS[itemKey] ?? null
}
