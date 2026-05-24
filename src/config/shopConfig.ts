import type { ItemRarity } from "@/contracts/economy-contract"

export const SHOP_CONFIG = {
  /** Fraction of catalog base price returned when selling */
  SELL_PRICE_RATE: 0.5,
  /** Black market featured slots per day */
  ROTATION_SLOT_COUNT: 8,
  /** Max discount on featured rotation items (percent) */
  MAX_ROTATION_DISCOUNT_PCT: 25,
  /** XP → credit conversion tiers (inefficient at scale) */
  XP_CONVERSION_TIERS: [
    { xp: 100, credits: 10 },
    { xp: 1000, credits: 70 },
    { xp: 5000, credits: 250 },
  ] as const,
  /** Fraction of XP lost as Hunter Core tax during conversion */
  CONVERSION_TAX_RATE: 0.3,
  /** Max conversions per UTC day */
  DAILY_CONVERSION_LIMIT: 3,
  /** Lore warning shown before conversion */
  CONVERSION_WARNING:
    "Converting XP destabilizes your Hunter Core. Proceed?",
} as const

export const RARITY_COLORS: Record<
  ItemRarity,
  { border: string; text: string; glow: string }
> = {
  COMMON: {
    border: "border-zinc-600/50",
    text: "text-zinc-400",
    glow: "",
  },
  RARE: {
    border: "border-blue-500/40",
    text: "text-blue-400",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  },
  EPIC: {
    border: "border-purple-500/40",
    text: "text-purple-400",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  },
  LEGENDARY: {
    border: "border-amber-500/40",
    text: "text-amber-400",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.2)]",
  },
  CORRUPTED: {
    border: "border-red-500/50",
    text: "text-red-400",
    glow: "shadow-[0_0_16px_rgba(239,68,68,0.25)]",
  },
}

export const SHOP_CATEGORY_LABELS: Record<string, string> = {
  COMBAT_BOOST: "Combat Boosts",
  QUEST_MANIPULATION: "Quest Manipulation",
  DUNGEON_UTILITY: "Dungeon Utility",
  COSMETIC: "Cosmetics & Status",
  STANDARD: "Standard Supply",
}
