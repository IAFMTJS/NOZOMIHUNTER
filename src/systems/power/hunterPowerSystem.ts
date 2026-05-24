import type { PlayerContract } from "@/contracts/player-contract"
import { POWER_CONFIG } from "@/config/powerConfig"
import { countEquippedItems } from "@/systems/inventory/inventorySystem"
import { statBufferBonus } from "@/systems/economy/boostSystem"

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

  const rw = POWER_CONFIG.RPG_WEIGHTS
  const r = player.rpgStats
  const rpgSum =
    r.strength * rw.strength +
    r.agility * rw.agility +
    r.intelligence * rw.intelligence +
    r.vitality * rw.vitality

  const bufferBonus = statBufferBonus(player)
  const levelBonus = (player.level + bufferBonus) * POWER_CONFIG.LEVEL_MULTIPLIER
  const gearBonus =
    countEquippedItems(player.inventory) * POWER_CONFIG.GEAR_BONUS_PER_EQUIPPED
  const total = Math.round(statSum + rpgSum + levelBonus + gearBonus)

  const attackBase = Math.round(
    r.strength * 4 + r.agility * 2 + total * 0.25
  )
  const defenseBase = Math.round(r.vitality * 4 + total * 0.18)

  return {
    total,
    attack: attackBase,
    defense: defenseBase,
    critRate: Math.min(45, 5 + Math.floor(r.agility / 8) + Math.floor(s.confidence / 15)),
    critDamage: Math.round(120 + r.intelligence * 1.2 + s.intelligence * 0.4),
  }
}

export function recommendedPowerForDungeon(minLevel: number): number {
  return minLevel * POWER_CONFIG.LEVEL_MULTIPLIER + 800
}
