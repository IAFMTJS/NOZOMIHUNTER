import type { PlayerContract } from "@/contracts/player-contract"
import { POWER_CONFIG } from "@/config/powerConfig"
import { countEquippedItems } from "@/systems/inventory/inventorySystem"

export interface HunterPowerBreakdown {
  total: number
  attack: number
  defense: number
  critRate: number
  critDamage: number
}

export function computeHunterPower(player: PlayerContract): HunterPowerBreakdown {
  const w = POWER_CONFIG.STAT_WEIGHTS
  const s = player.stats
  const statSum =
    s.vocabulary * w.vocabulary +
    s.grammar * w.grammar +
    s.listening * w.listening +
    s.speaking * w.speaking +
    s.confidence * w.confidence +
    s.intelligence * w.intelligence +
    s.consistency * w.consistency

  const levelBonus = player.level * POWER_CONFIG.LEVEL_MULTIPLIER
  const gearBonus =
    countEquippedItems(player.inventory) * POWER_CONFIG.GEAR_BONUS_PER_EQUIPPED
  const total = Math.round(statSum + levelBonus + gearBonus)

  return {
    total,
    attack: Math.round(total * 0.42),
    defense: Math.round(total * 0.28),
    critRate: Math.min(45, 5 + Math.floor(s.confidence / 10)),
    critDamage: Math.round(120 + s.intelligence * 0.8),
  }
}

export function recommendedPowerForDungeon(minLevel: number): number {
  return minLevel * POWER_CONFIG.LEVEL_MULTIPLIER + 800
}
