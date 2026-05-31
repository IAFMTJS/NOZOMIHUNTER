import { getPrimarySeason } from "@/config/seasonConfig"
import type { PlayerContract } from "@/contracts/player-contract"

export interface SeasonProgressView {
  seasonId: string
  label: string
  points: number
  tier: number
  nextTierAt: number
  progressPercent: number
}

const TIER_STEP = 100

export function buildSeasonProgressView(
  player: PlayerContract,
  stored?: { points: number; tier: number } | null
): SeasonProgressView | null {
  const season = getPrimarySeason()
  if (!season) return null

  const points = stored?.points ?? Math.min(500, player.level * 12 + player.xp / 20)
  const tier = stored?.tier ?? Math.floor(points / TIER_STEP)
  const tierFloor = tier * TIER_STEP
  const nextTierAt = tierFloor + TIER_STEP
  const progressPercent = Math.round(
    ((points - tierFloor) / Math.max(1, nextTierAt - tierFloor)) * 100
  )

  return {
    seasonId: season.id,
    label: season.label,
    points,
    tier,
    nextTierAt,
    progressPercent: Math.min(100, progressPercent),
  }
}
