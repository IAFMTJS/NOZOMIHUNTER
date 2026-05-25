import type { PlayerContract } from "@/contracts/player-contract"
import { getUnlockEntry } from "@/config/unlockRegistry"

export function formatUnlockList(keys: string[]): { key: string; label: string }[] {
  return keys.map((key) => ({ key, label: getUnlockEntry(key).label }))
}

export function profileSummary(player: PlayerContract) {
  const systems = formatUnlockList(player.progression.unlockedSystems)
  const dungeons = formatUnlockList(player.progression.unlockedDungeons)
  const titles = formatUnlockList(player.progression.titles)
  const masterSeals = player.progression.titles
    .filter((t) => t.startsWith("master:") || t.includes("Breaker") || t.includes("Survivor") || t.includes("Listener") || t.includes("Bound"))
    .map((t) => ({ key: t, label: t.replace(/^master:/, "").replace(/:/g, " · ") }))

  return { systems, dungeons, titles, masterSeals }
}
