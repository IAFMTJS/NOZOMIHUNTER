import type {
  ItemCatalogEntryContract,
  PurchaseQuoteContract,
  ShopListingContract,
} from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { inventoryCapacityRemaining } from "@/systems/inventory/inventorySystem"

export function toShopListings(
  catalog: ItemCatalogEntryContract[]
): ShopListingContract[] {
  return catalog
    .filter((e) => e.creditPrice != null && e.creditPrice > 0)
    .map((e) => ({ ...e, creditPrice: e.creditPrice! }))
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
  }
}

export function canPurchase(
  player: PlayerContract,
  listing: ShopListingContract,
  quantity: number
): boolean {
  const q = purchaseQuote(player, listing, quantity)
  return q.canAfford && q.capacityOk && quantity > 0
}
