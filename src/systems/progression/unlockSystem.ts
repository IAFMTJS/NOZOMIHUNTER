import type { PlayerProgressionContract } from "@/contracts/player-contract"

export function mergeUnlocks(
  current: PlayerProgressionContract,
  newUnlocks?: string[]
): PlayerProgressionContract {
  if (!newUnlocks?.length) return current

  const systems = new Set([
    ...current.unlockedSystems,
    ...newUnlocks.filter((u) => u.startsWith("system:")),
  ])
  const dungeons = new Set([
    ...current.unlockedDungeons,
    ...newUnlocks.filter((u) => u.startsWith("dungeon:")),
  ])
  const titles = new Set([
    ...current.titles,
    ...newUnlocks.filter((u) => u.startsWith("title:")),
  ])

  return {
    unlockedSystems: [...systems],
    unlockedDungeons: [...dungeons],
    titles: [...titles],
  }
}

export function defaultProgression(): PlayerProgressionContract {
  return {
    unlockedDungeons: [],
    unlockedSystems: ["quests", "dashboard"],
    titles: [],
  }
}
