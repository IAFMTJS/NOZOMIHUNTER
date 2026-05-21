import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  getDungeonDefinition,
  listAvailableDungeons,
} from "@/config/dungeonConfig"

export function hasActiveDungeon(activeQuests: QuestContract[]): boolean {
  return activeQuests.some((q) => q.type === "DUNGEON" && q.dungeonRun)
}

export function canStartDungeon(
  player: PlayerContract,
  activeQuests: QuestContract[],
  dungeonKey: string
): { ok: boolean; reason?: string } {
  if (hasActiveDungeon(activeQuests)) {
    return { ok: false, reason: "Finish or abandon your current dungeon first." }
  }

  try {
    const def = getDungeonDefinition(dungeonKey)
    if (player.level < def.minLevel) {
      return {
        ok: false,
        reason: `Reach level ${def.minLevel} to enter this sector.`,
      }
    }
  } catch {
    return { ok: false, reason: "Unknown dungeon." }
  }

  const available = listAvailableDungeons(
    player.level,
    player.progression.unlockedDungeons
  )
  if (!available.some((d) => d.key === dungeonKey)) {
    return { ok: false, reason: "This dungeon is not unlocked yet." }
  }

  return { ok: true }
}
