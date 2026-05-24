import type {
  ActiveBoostContract,
  BoostEffectType,
} from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { getItemEffect } from "@/config/shopItemEffects"

const MISTAKE_SHIELD_ATTEMPTS = 999

export function pruneExpiredBoosts(
  boosts: ActiveBoostContract[],
  now = Date.now()
): ActiveBoostContract[] {
  return boosts.filter((b) => {
    if (b.usesRemaining != null && b.usesRemaining <= 0) return false
    if (b.expiresAt && new Date(b.expiresAt).getTime() <= now) return false
    return true
  })
}

export function activeBoostsForPlayer(
  player: PlayerContract
): ActiveBoostContract[] {
  return pruneExpiredBoosts(player.economy.activeBoosts)
}

export function hasActiveBoost(
  player: PlayerContract,
  effectType: BoostEffectType
): boolean {
  return activeBoostsForPlayer(player).some((b) => b.effectType === effectType)
}

export function xpGainMultiplier(player: PlayerContract): number {
  const boosts = activeBoostsForPlayer(player).filter(
    (b) => b.effectType === "XP_BOOST"
  )
  if (boosts.length === 0) return 1
  let mult = 1
  for (const boost of boosts) {
    const effect = getItemEffect(boost.itemKey)
    if (effect?.xpMultiplier) {
      mult = Math.max(mult, effect.xpMultiplier)
    }
  }
  return mult
}

export function rewardAmplifierMultiplier(player: PlayerContract): number {
  return hasActiveBoost(player, "REWARD_AMPLIFIER") ? 2 : 1
}

export function combinedRewardMultiplier(player: PlayerContract): number {
  return xpGainMultiplier(player) * rewardAmplifierMultiplier(player)
}

export function maxWrongAttemptsWithBoosts(
  player: PlayerContract,
  baseMax: number
): number {
  if (hasActiveBoost(player, "MISTAKE_SHIELD")) {
    return MISTAKE_SHIELD_ATTEMPTS
  }
  return baseMax
}

export function statBufferBonus(player: PlayerContract): number {
  const boosts = activeBoostsForPlayer(player).filter(
    (b) => b.effectType === "STAT_BUFFER"
  )
  if (boosts.length === 0) return 0
  let bonus = 0
  for (const boost of boosts) {
    const effect = getItemEffect(boost.itemKey)
    if (effect?.statBonus) bonus += effect.statBonus
  }
  return bonus
}

export function hasReviveToken(player: PlayerContract): boolean {
  return hasActiveBoost(player, "REVIVE_TOKEN")
}

export function hasEscapeBeacon(player: PlayerContract): boolean {
  return hasActiveBoost(player, "ESCAPE_BEACON")
}

export function buildActiveBoostFromItem(
  itemKey: string,
  now = Date.now()
): ActiveBoostContract | null {
  const effect = getItemEffect(itemKey)
  if (!effect) return null

  const expiresAt =
    effect.durationMs != null
      ? new Date(now + effect.durationMs).toISOString()
      : null

  return {
    effectType: effect.effectType,
    itemKey,
    expiresAt,
    usesRemaining: effect.uses,
    metadata: {
      ...(effect.xpMultiplier != null
        ? { xpMultiplier: effect.xpMultiplier }
        : {}),
      ...(effect.statBonus != null ? { statBonus: effect.statBonus } : {}),
      ...(effect.titleKey ? { titleKey: effect.titleKey } : {}),
      ...(effect.auraKey ? { auraKey: effect.auraKey } : {}),
    },
  }
}

export function canStackBoost(
  current: ActiveBoostContract[],
  incoming: ActiveBoostContract
): boolean {
  if (incoming.effectType === "XP_BOOST") {
    return !current.some(
      (b) => b.effectType === "XP_BOOST" && b.expiresAt != null
    )
  }
  if (incoming.effectType === "MISTAKE_SHIELD") {
    return !current.some((b) => b.effectType === "MISTAKE_SHIELD")
  }
  if (incoming.effectType === "STAT_BUFFER") {
    return !current.some(
      (b) =>
        b.effectType === "STAT_BUFFER" && b.itemKey === incoming.itemKey
    )
  }
  return true
}

export function mergeBoostActivation(
  current: ActiveBoostContract[],
  itemKey: string,
  now = Date.now()
): ActiveBoostContract[] {
  const pruned = pruneExpiredBoosts(current, now)
  const incoming = buildActiveBoostFromItem(itemKey, now)
  if (!incoming) return pruned
  if (!canStackBoost(pruned, incoming)) return pruned
  return [...pruned, incoming]
}

export function consumeBoostUse(
  boosts: ActiveBoostContract[],
  effectType: BoostEffectType
): ActiveBoostContract[] {
  const idx = boosts.findIndex((b) => b.effectType === effectType)
  if (idx < 0) return boosts
  const target = boosts[idx]!
  if (target.usesRemaining == null) return boosts
  const next = target.usesRemaining - 1
  if (next <= 0) {
    return boosts.filter((_, i) => i !== idx)
  }
  return boosts.map((b, i) =>
    i === idx ? { ...b, usesRemaining: next } : b
  )
}
