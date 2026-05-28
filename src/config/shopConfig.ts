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
    border: "border-[var(--border-subtle)]",
    text: "text-[var(--muted)]",
    glow: "",
  },
  RARE: {
    border: "border-[var(--border-accent)]",
    text: "text-[var(--accent-bright)]",
    glow: "shadow-[0_0_12px_var(--glow-accent)]",
  },
  EPIC: {
    border: "border-[var(--corruption)]/40",
    text: "text-[var(--corruption)]",
    glow: "shadow-[0_0_12px_var(--corruption-a15)]",
  },
  LEGENDARY: {
    border: "border-[var(--reward)]/40",
    text: "text-[var(--reward)]",
    glow: "shadow-[0_0_16px_var(--glow-reward)]",
  },
  CORRUPTED: {
    border: "border-[var(--danger)]/50",
    text: "text-[var(--danger)]",
    glow: "shadow-[0_0_16px_var(--danger-a25)]",
  },
}

export const SHOP_CATEGORY_LABELS: Record<string, string> = {
  COMBAT_BOOST: "Combat Boosts",
  QUEST_MANIPULATION: "Quest Manipulation",
  DUNGEON_UTILITY: "Dungeon Utility",
  COSMETIC: "Cosmetics & Status",
  STANDARD: "Standard Supply",
}
