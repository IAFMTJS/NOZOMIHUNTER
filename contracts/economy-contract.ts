export type ItemCategory = "EQUIPMENT" | "CONSUMABLE" | "MISC" | "MATERIAL"

export type ShopCategory =
  | "COMBAT_BOOST"
  | "QUEST_MANIPULATION"
  | "DUNGEON_UTILITY"
  | "COSMETIC"
  | "STANDARD"

export type ItemRarity =
  | "COMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "CORRUPTED"

export type BoostEffectType =
  | "MISTAKE_SHIELD"
  | "XP_BOOST"
  | "STAT_BUFFER"
  | "RANK_SHIELD"
  | "REWARD_AMPLIFIER"
  | "DIFFICULTY_OVERRIDE"
  | "QUEST_RETRY"
  | "SKIP_TOKEN"
  | "REVIVE_TOKEN"
  | "ESCAPE_BEACON"
  | "TIME_FREEZE"
  | "COSMETIC_AURA"
  | "TITLE_UNLOCK"

export interface ItemCatalogEntryContract {
  key: string
  name: string
  category: ItemCategory
  icon: string
  stackable: boolean
  creditPrice?: number | null
  shopCategory?: ShopCategory | null
  rarity?: ItemRarity | null
  description?: string | null
  effectType?: BoostEffectType | null
  rotationEligible?: boolean
}

export interface ShopListingContract extends ItemCatalogEntryContract {
  creditPrice: number
  featured?: boolean
  discountPct?: number
  rotationAvailable?: boolean
}

export interface PurchaseQuoteContract {
  itemKey: string
  quantity: number
  unitPrice: number
  totalPrice: number
  canAfford: boolean
  capacityOk: boolean
  rotationAvailable: boolean
}

export interface InventorySlotContract {
  itemKey: string
  quantity: number
  equipped?: boolean
}

export interface ActiveBoostContract {
  effectType: BoostEffectType
  itemKey: string
  expiresAt: string | null
  usesRemaining: number | null
  metadata?: Record<string, number | string>
}

export interface PlayerEconomyContract {
  credits: number
  stamina: number
  staminaMax: number
  brewTokens: number
  activeBoosts: ActiveBoostContract[]
  xpConversionCount: number
  xpConversionDate: string | null
}

export interface XpConversionQuoteContract {
  xpAmount: number
  creditsGained: number
  xpSpent: number
  taxLost: number
  canAfford: boolean
  dailyLimitReached: boolean
  conversionsRemaining: number
}

export interface PendingRewardItemContract {
  itemKey: string
  quantity: number
}

export interface PendingRewardBundleContract {
  xpGained: number
  credits?: number
  items: PendingRewardItemContract[]
  questId?: string
  claimed: boolean
  boostsConsumed?: string[]
}

/** UI-only preview; server grants via complete_quest_guarded. */
export interface CompletionBoostPreviewContract {
  xp: number
  credits: number
}
