import type { PlayerContract } from "@/contracts/player-contract"

export interface AchievementContract {
  id: string
  title: string
  description: string
  unlocked: boolean
}

const DEFINITIONS: Omit<AchievementContract, "unlocked">[] = [
  {
    id: "first-level",
    title: "Rank elevation",
    description: "Reach hunter level 2.",
  },
  {
    id: "discipline-3",
    title: "Discipline chain",
    description: "Maintain synchronization for 3 days.",
  },
  {
    id: "neon-clear",
    title: "Neon breach",
    description: "Unlock the Neon Corridor sector.",
  },
  {
    id: "vocab-master",
    title: "Threat neutralized",
    description: "Earn a vocabulary mastery title.",
  },
]

export function resolveAchievements(player: PlayerContract): AchievementContract[] {
  const titles = new Set(player.progression.titles)
  const unlocks = new Set([
    ...player.progression.unlockedDungeons,
    ...player.progression.unlockedSystems,
    ...player.progression.titles,
  ])

  return DEFINITIONS.map((def) => {
    let unlocked = false
    switch (def.id) {
      case "first-level":
        unlocked = player.level >= 2
        break
      case "discipline-3":
        unlocked = player.synchronization.chainDays >= 3
        break
      case "neon-clear":
        unlocked = unlocks.has("dungeon:neon-corridor")
        break
      case "vocab-master":
        unlocked = [...titles].some((t) => t.includes("vocab") || t.includes("mastery"))
        break
    }
    return { ...def, unlocked }
  })
}
