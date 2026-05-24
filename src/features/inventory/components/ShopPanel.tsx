import { SHOP_CATEGORY_LABELS } from "@/config/shopConfig"
import type { PlayerContract } from "@/contracts/player-contract"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import {
  canPurchase,
  listingsByCategory,
  toShopListings,
} from "@/systems/economy/shopSystem"
import { ShopListingCard } from "@/features/inventory/components/ShopListingCard"
import { XpConversionPanel } from "@/features/inventory/components/XpConversionPanel"
import { ActiveBoostsRail } from "@/features/inventory/components/ActiveBoostsRail"

interface ShopPanelProps {
  player: PlayerContract
  userId: string
  catalog: ItemCatalogEntryContract[]
  busy: boolean
  message: string | null
  onPurchase: (itemKey: string) => void
  onConvertXp: (amount: number) => void
}

export function ShopPanel({
  player,
  userId,
  catalog,
  busy,
  message,
  onPurchase,
  onConvertXp,
}: ShopPanelProps) {
  const shopListings = toShopListings(catalog, userId)
  const grouped = listingsByCategory(shopListings)
  const categories = [...grouped.keys()].sort()

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-900/30 bg-red-950/10 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80">
          Black Market Terminal
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Daily rotation active. Featured items carry volatile discounts.
        </p>
      </div>

      <ActiveBoostsRail player={player} userId={userId} />

      <XpConversionPanel
        player={player}
        busy={busy}
        onConvert={onConvertXp}
      />

      {message && (
        <p className="text-center text-xs text-[var(--muted)]">{message}</p>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Supply channel offline.</p>
      ) : (
        categories.map((cat) => {
          const listings = grouped.get(cat) ?? []
          return (
            <section key={cat}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                {SHOP_CATEGORY_LABELS[cat] ?? cat}
              </h3>
              <ul className="space-y-2">
                {listings.map((listing) => (
                  <ShopListingCard
                    key={listing.key}
                    listing={listing}
                    canBuy={canPurchase(player, listing, 1)}
                    busy={busy}
                    onPurchase={() => onPurchase(listing.key)}
                  />
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
