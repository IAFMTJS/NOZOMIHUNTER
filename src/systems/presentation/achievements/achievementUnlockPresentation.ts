import type { PlayerContract } from "@/contracts/player-contract"
import {
  resolveAchievements,
  type AchievementContract,
} from "@/systems/progression/achievementSystem"

export function detectNewAchievements(
  previous: PlayerContract | null,
  current: PlayerContract
): AchievementContract[] {
  const prevMap = new Map(
    (previous ? resolveAchievements(previous) : []).map((a) => [a.id, a.unlocked])
  )
  return resolveAchievements(current).filter((a) => a.unlocked && !prevMap.get(a.id))
}
