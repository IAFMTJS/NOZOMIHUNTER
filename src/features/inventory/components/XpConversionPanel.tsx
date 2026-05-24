import type { PlayerContract } from "@/contracts/player-contract"
import { SHOP_CONFIG } from "@/config/shopConfig"
import { Button } from "@/components/ui/Button"
import {
  canConvertXp,
  conversionWarningMessage,
  xpConversionQuote,
} from "@/systems/economy/xpConversionSystem"

interface XpConversionPanelProps {
  player: PlayerContract
  busy: boolean
  onConvert: (amount: number) => void
}

export function XpConversionPanel({
  player,
  busy,
  onConvert,
}: XpConversionPanelProps) {
  const tiers = SHOP_CONFIG.XP_CONVERSION_TIERS

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        Hunter Core Exchange
      </p>
      <p className="mt-1 text-xs italic text-red-400/70">
        {conversionWarningMessage()}
      </p>
      <ul className="mt-3 space-y-2">
        {tiers.map((tier) => {
          const quote = xpConversionQuote(player, tier.xp)
          const ok = canConvertXp(player, tier.xp)
          return (
            <li
              key={tier.xp}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-[var(--foreground)]">
                {tier.xp} XP → ~{quote.creditsGained} cr
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!ok || busy}
                onClick={() => onConvert(tier.xp)}
              >
                Convert
              </Button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[10px] text-[var(--muted)]">
        {quoteRemainingLabel(player)}
      </p>
    </div>
  )
}

function quoteRemainingLabel(player: PlayerContract): string {
  const quote = xpConversionQuote(player, 100)
  if (quote.dailyLimitReached) {
    return "Daily conversion limit reached."
  }
  return `${quote.conversionsRemaining} conversion${quote.conversionsRemaining === 1 ? "" : "s"} remaining today.`
}
