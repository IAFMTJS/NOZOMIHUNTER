import type { PlayerContract } from "@/contracts/player-contract"

/** Stable key for fields that affect `resolveAchievements` unlock state. */
export function achievementUnlockFingerprint(player: PlayerContract): string {
  const { progression, synchronization } = player
  return [
    player.level,
    synchronization.chainDays,
    [...progression.titles].sort().join("|"),
    [...progression.unlockedDungeons].sort().join("|"),
    [...progression.unlockedSystems].sort().join("|"),
  ].join(";")
}
