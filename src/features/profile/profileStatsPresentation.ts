import type { PlayerContract } from "@/contracts/player-contract"

export interface ProfileStatsView {
  missionsCompleted: number
  dungeonsCleared: number
  newWordsLearned: number
  playTimeHours: number
  equippedTitle: string | null
}

export function buildProfileStats(player: PlayerContract): ProfileStatsView {
  const dungeonsCleared = Math.max(
    0,
    player.progression.unlockedDungeons.length - 1
  )

  return {
    missionsCompleted: Math.max(0, Math.floor(player.xp / 120)),
    dungeonsCleared,
    newWordsLearned: player.stats.vocabulary,
    playTimeHours: Math.max(
      1,
      Math.round((player.synchronization.chainDays * 0.75 + player.level * 0.5) * 10) /
        10
    ),
    equippedTitle: player.progression.titles[0] ?? null,
  }
}
