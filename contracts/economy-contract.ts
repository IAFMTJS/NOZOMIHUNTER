export type ItemCategory = "EQUIPMENT" | "CONSUMABLE" | "MISC" | "MATERIAL"

export interface ItemCatalogEntryContract {
  key: string
  name: string
  category: ItemCategory
  icon: string
  stackable: boolean
  creditPrice?: number | null
}

export interface ShopListingContract extends ItemCatalogEntryContract {
  creditPrice: number
}

export interface PurchaseQuoteContract {
  itemKey: string
  quantity: number
  unitPrice: number
  totalPrice: number
  canAfford: boolean
  capacityOk: boolean
}

export interface InventorySlotContract {
  itemKey: string
  quantity: number
  equipped?: boolean
}

export interface PlayerEconomyContract {
  credits: number
  stamina: number
  staminaMax: number
  brewTokens: number
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
}
