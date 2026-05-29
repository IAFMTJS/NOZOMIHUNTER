import type { PlayerContract } from "@/contracts/player-contract"
import { listContentAchievementDefinitions } from "@/systems/content/contentAchievementCatalog"

export interface AchievementContract {
  id: string
  title: string
  description: string
  unlocked: boolean
}

function isAchievementUnlocked(
  defId: string,
  player: PlayerContract,
  unlocks: Set<string>,
  titles: Set<string>
): boolean {
  switch (defId) {
    case "first-level":
      return player.level >= 2
    case "discipline-3":
      return player.synchronization.chainDays >= 3
    case "neon-clear":
      return unlocks.has("dungeon:neon-corridor")
    case "abyss-clear":
      return unlocks.has("dungeon:abyss-core")
    case "vocab-master":
      return [...titles].some((t) => t.includes("vocab") || t.includes("mastery"))
    case "gatebreaker":
      return titles.has("Gatebreaker")
    case "archive-breaker":
      return titles.has("Archive Breaker")
    case "master-rival":
      return [...titles].some((t) => t.includes("master:") && t.includes(":rival"))
    default:
      if (defId.startsWith("gdd-achievement-")) {
        const n = parseInt(defId.replace("gdd-achievement-", ""), 10)
        const threshold = 5 + (n - 9)
        return player.level >= threshold || player.xp >= threshold * 50
      }
      return false
  }
}

export function resolveAchievements(player: PlayerContract): AchievementContract[] {
  const titles = new Set(player.progression.titles)
  const unlocks = new Set([
    ...player.progression.unlockedDungeons,
    ...player.progression.unlockedSystems,
    ...player.progression.titles,
  ])

  return listContentAchievementDefinitions().map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    unlocked: isAchievementUnlocked(def.id, player, unlocks, titles),
  }))
}
