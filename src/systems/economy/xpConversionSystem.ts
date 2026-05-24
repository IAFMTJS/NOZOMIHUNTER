import type {
  ActiveBoostContract,
  XpConversionQuoteContract,
} from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { SHOP_CONFIG } from "@/config/shopConfig"
import { getItemEffect } from "@/config/shopItemEffects"

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function conversionsRemainingToday(
  count: number,
  date: string | null
): number {
  const today = utcToday()
  const used = date === today ? count : 0
  return Math.max(0, SHOP_CONFIG.DAILY_CONVERSION_LIMIT - used)
}

export function creditsForXpAmount(xpAmount: number): number {
  const tiers = [...SHOP_CONFIG.XP_CONVERSION_TIERS].sort(
    (a, b) => b.xp - a.xp
  )
  for (const tier of tiers) {
    if (xpAmount >= tier.xp) {
      const scale = xpAmount / tier.xp
      return Math.floor(tier.credits * scale * (1 - SHOP_CONFIG.CONVERSION_TAX_RATE))
    }
  }
  return 0
}

export function xpConversionQuote(
  player: PlayerContract,
  xpAmount: number
): XpConversionQuoteContract {
  const remaining = conversionsRemainingToday(
    player.economy.xpConversionCount,
    player.economy.xpConversionDate
  )
  const dailyLimitReached = remaining <= 0
  const canAfford = player.xp >= xpAmount && xpAmount > 0
  const creditsGained = creditsForXpAmount(xpAmount)
  const taxLost = Math.floor(xpAmount * SHOP_CONFIG.CONVERSION_TAX_RATE)

  return {
    xpAmount,
    creditsGained,
    xpSpent: xpAmount,
    taxLost,
    canAfford,
    dailyLimitReached,
    conversionsRemaining: remaining,
  }
}

export function canConvertXp(
  player: PlayerContract,
  xpAmount: number
): boolean {
  const q = xpConversionQuote(player, xpAmount)
  return q.canAfford && !q.dailyLimitReached && q.creditsGained > 0
}

export function conversionWarningMessage(): string {
  return SHOP_CONFIG.CONVERSION_WARNING
}

export function parseActiveBoosts(raw: unknown): ActiveBoostContract[] {
  if (!Array.isArray(raw)) return []
  const boosts: ActiveBoostContract[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue
    const row = entry as Record<string, unknown>
    const effectType = row["effectType"]
    const itemKey = row["itemKey"]
    if (typeof effectType !== "string" || typeof itemKey !== "string") continue
    boosts.push({
      effectType: effectType as ActiveBoostContract["effectType"],
      itemKey,
      expiresAt: typeof row.expiresAt === "string" ? row.expiresAt : null,
      usesRemaining:
        typeof row.usesRemaining === "number" ? row.usesRemaining : null,
      metadata: enrichBoostMetadata(
        itemKey,
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, number | string>)
          : undefined
      ),
    })
  }
  return boosts
}

function enrichBoostMetadata(
  itemKey: string,
  raw?: Record<string, number | string>
): Record<string, number | string> | undefined {
  const effect = getItemEffect(itemKey)
  const merged: Record<string, number | string> = { ...raw }
  if (effect?.auraKey && merged.auraKey == null) merged.auraKey = effect.auraKey
  if (effect?.titleKey && merged.titleKey == null) merged.titleKey = effect.titleKey
  if (effect?.xpMultiplier != null && merged.xpMultiplier == null) {
    merged.xpMultiplier = effect.xpMultiplier
  }
  return Object.keys(merged).length > 0 ? merged : undefined
}
