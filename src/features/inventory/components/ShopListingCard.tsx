import type { ShopListingContract } from "@/contracts/economy-contract"
import { RARITY_COLORS } from "@/config/shopConfig"
import { Button } from "@/components/ui/Button"

interface ShopListingCardProps {
  listing: ShopListingContract
  canBuy: boolean
  busy: boolean
  onPurchase: () => void
}

export function ShopListingCard({
  listing,
  canBuy,
  busy,
  onPurchase,
}: ShopListingCardProps) {
  const rarity = listing.rarity ?? "COMMON"
  const colors = RARITY_COLORS[rarity]

  return (
    <li
      className={`rounded-xl border px-4 py-3 ${colors.border} ${colors.glow}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {listing.name}
          </p>
          <p className={`text-[10px] uppercase tracking-wide ${colors.text}`}>
            {listing.rarity ?? "COMMON"}
            {listing.discountPct && listing.discountPct > 0
              ? ` · -${listing.discountPct}%`
              : ""}
          </p>
        </div>
        {listing.featured && (
          <span className="shrink-0 rounded bg-red-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
            Featured
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {listing.description ?? "Black market supply."}
        </p>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs font-semibold text-[var(--reward)]">
            {listing.creditPrice} cr
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={!canBuy || busy}
            onClick={onPurchase}
          >
            Acquire
          </Button>
        </div>
      </div>
    </li>
  )
}
