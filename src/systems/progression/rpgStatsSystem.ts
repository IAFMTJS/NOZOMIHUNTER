import type { HunterRank, RpgStatsContract } from "@/contracts/player-contract"
import { RPG_STATS_CONFIG } from "@/config/rpgStatsConfig"

function clampStat(value: number, cap: number): number {
  return Math.min(cap, Math.max(0, Math.round(value)))
}

export function clampRpgStats(stats: RpgStatsContract): RpgStatsContract {
  const caps = RPG_STATS_CONFIG.CAPS
  return {
    strength: clampStat(stats.strength, caps.strength),
    agility: clampStat(stats.agility, caps.agility),
    intelligence: clampStat(stats.intelligence, caps.intelligence),
    vitality: clampStat(stats.vitality, caps.vitality),
  }
}

/** Derive RPG stats from level and rank when DB row is missing or zeroed. */
export function deriveRpgStatsFromProgress(
  level: number,
  rank: HunterRank
): RpgStatsContract {
  const lvl = Math.max(1, level)
  const rankBonus = RPG_STATS_CONFIG.RANK_BONUS[rank]
  const base = RPG_STATS_CONFIG.BASE
  const per = RPG_STATS_CONFIG.PER_LEVEL

  return clampRpgStats({
    strength: base.strength + (lvl - 1) * per.strength + rankBonus,
    agility: base.agility + (lvl - 1) * per.agility + rankBonus,
    intelligence:
      base.intelligence + (lvl - 1) * per.intelligence + rankBonus,
    vitality: base.vitality + (lvl - 1) * per.vitality + rankBonus,
  })
}

export function resolveRpgStats(
  level: number,
  rank: HunterRank,
  stored: Partial<RpgStatsContract> | null | undefined
): RpgStatsContract {
  const hasStored =
    stored &&
    (stored.strength ?? 0) > 0 &&
    (stored.agility ?? 0) > 0 &&
    (stored.intelligence ?? 0) > 0 &&
    (stored.vitality ?? 0) > 0

  if (hasStored) {
    return clampRpgStats({
      strength: stored!.strength ?? 0,
      agility: stored!.agility ?? 0,
      intelligence: stored!.intelligence ?? 0,
      vitality: stored!.vitality ?? 0,
    })
  }

  return deriveRpgStatsFromProgress(level, rank)
}

export function applyLevelUpDelta(
  current: RpgStatsContract,
  levelsGained: number,
  rank: HunterRank
): RpgStatsContract {
  if (levelsGained <= 0) return clampRpgStats(current)

  const delta = RPG_STATS_CONFIG.LEVEL_UP_DELTA
  const rankBonus = RPG_STATS_CONFIG.RANK_BONUS[rank]

  return clampRpgStats({
    strength:
      current.strength + levelsGained * delta.strength + (rankBonus > 0 ? 1 : 0),
    agility:
      current.agility + levelsGained * delta.agility + (rankBonus > 0 ? 1 : 0),
    intelligence:
      current.intelligence +
      levelsGained * delta.intelligence +
      (rankBonus > 0 ? 1 : 0),
    vitality:
      current.vitality + levelsGained * delta.vitality + (rankBonus > 0 ? 1 : 0),
  })
}
