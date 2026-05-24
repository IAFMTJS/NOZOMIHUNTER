import type {
  ItemCatalogEntryContract,
  PurchaseQuoteContract,
  ShopListingContract,
} from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { inventoryCapacityRemaining } from "@/systems/inventory/inventorySystem"
import {
  buildShopRotationContext,
  enrichListingWithRotation,
  type ShopRotationContext,
} from "@/systems/economy/shopRotationSystem"

export function toShopListings(
  catalog: ItemCatalogEntryContract[],
  playerId?: string,
  date?: string
): ShopListingContract[] {
  if (!playerId) {
    return catalog
      .filter((e) => e.creditPrice != null && e.creditPrice > 0)
      .map((e) => ({ ...e, creditPrice: e.creditPrice!, rotationAvailable: true }))
  }

  const ctx = buildShopRotationContext(playerId, catalog, date)
  return catalog
    .map((item) => enrichListingWithRotation(item, ctx))
    .filter((l): l is ShopListingContract => l != null)
    .sort((a, b) => {
      const cat = (a.shopCategory ?? "STANDARD").localeCompare(
        b.shopCategory ?? "STANDARD"
      )
      if (cat !== 0) return cat
      return a.creditPrice - b.creditPrice
    })
}

export function shopRotationContext(
  playerId: string,
  catalog: ItemCatalogEntryContract[],
  date?: string
): ShopRotationContext {
  return buildShopRotationContext(playerId, catalog, date)
}

export function purchaseQuote(
  player: PlayerContract,
  listing: ShopListingContract,
  quantity: number
): PurchaseQuoteContract {
  const totalPrice = listing.creditPrice * quantity
  return {
    itemKey: listing.key,
    quantity,
    unitPrice: listing.creditPrice,
    totalPrice,
    canAfford: player.economy.credits >= totalPrice,
    capacityOk: inventoryCapacityRemaining(player.inventory) >= quantity,
    rotationAvailable: listing.rotationAvailable !== false,
  }
}

export function canPurchase(
  player: PlayerContract,
  listing: ShopListingContract,
  quantity: number
): boolean {
  const q = purchaseQuote(player, listing, quantity)
  return (
    q.canAfford &&
    q.capacityOk &&
    q.rotationAvailable &&
    quantity > 0
  )
}

export function listingsByCategory(
  listings: ShopListingContract[]
): Map<string, ShopListingContract[]> {
  const map = new Map<string, ShopListingContract[]>()
  for (const listing of listings) {
    const cat = listing.shopCategory ?? "STANDARD"
    const group = map.get(cat) ?? []
    group.push(listing)
    map.set(cat, group)
  }
  return map
}
