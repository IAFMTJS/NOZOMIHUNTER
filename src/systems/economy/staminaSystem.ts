import type { PlayerContract } from "@/contracts/player-contract"
import { STAMINA_CONFIG } from "@/config/staminaConfig"

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Refill stamina once per calendar day (UTC), keyed off last active date. */
export function applyDailyStaminaRegen(player: PlayerContract): {
  player: PlayerContract
  regenned: boolean
} {
  const last = player.synchronization.lastActiveDate
  const today = todayUtc()
  if (last === today) {
    return { player, regenned: false }
  }

  const stamina = Math.min(
    player.economy.staminaMax,
    player.economy.stamina + STAMINA_CONFIG.DAILY_REGEN
  )
  if (stamina === player.economy.stamina) {
    return { player, regenned: false }
  }

  return {
    player: {
      ...player,
      economy: { ...player.economy, stamina },
      updatedAt: new Date().toISOString(),
    },
    regenned: true,
  }
}

export function canSpendStamina(
  player: PlayerContract,
  amount: number = STAMINA_CONFIG.DUNGEON_ENTER_COST
): boolean {
  return player.economy.stamina >= amount
}

export function staminaAfterSpend(
  player: PlayerContract,
  amount: number
): PlayerContract {
  return {
    ...player,
    economy: {
      ...player.economy,
      stamina: Math.max(0, player.economy.stamina - amount),
    },
    updatedAt: new Date().toISOString(),
  }
}

export function defaultEconomy(): PlayerContract["economy"] {
  return {
    credits: 0,
    stamina: STAMINA_CONFIG.DEFAULT_START,
    staminaMax: STAMINA_CONFIG.DEFAULT_MAX,
    brewTokens: 10,
    activeBoosts: [],
    xpConversionCount: 0,
    xpConversionDate: null,
  }
}
