import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  DUNGEON_DEFINITIONS,
  getDungeonDefinition,
  listAvailableDungeons,
  type DungeonDefinitionConfig,
} from "@/config/dungeonConfig"

export type DungeonAccessStatus =
  | "available"
  | "locked_level"
  | "locked_prerequisite"
  | "blocked_active_run"

export interface DungeonAccessResult {
  status: DungeonAccessStatus
  reason: string
  minLevel: number
  canEnter: boolean
}

export function hasActiveDungeon(activeQuests: QuestContract[]): boolean {
  return activeQuests.some((q) => q.type === "DUNGEON" && q.dungeonRun)
}

export function listAllDungeonDefinitions(): DungeonDefinitionConfig[] {
  return [...DUNGEON_DEFINITIONS]
}

export function minDungeonLevel(): number {
  return Math.min(...DUNGEON_DEFINITIONS.map((d) => d.minLevel))
}

export function resolveDungeonAccess(
  player: PlayerContract,
  activeQuests: QuestContract[],
  dungeonKey: string
): DungeonAccessResult {
  let def: DungeonDefinitionConfig
  try {
    def = getDungeonDefinition(dungeonKey)
  } catch {
    return {
      status: "locked_prerequisite",
      reason: "Unknown sector.",
      minLevel: 99,
      canEnter: false,
    }
  }

  if (hasActiveDungeon(activeQuests)) {
    return {
      status: "blocked_active_run",
      reason: "Finish or abandon your current dungeon first.",
      minLevel: def.minLevel,
      canEnter: false,
    }
  }

  if (player.level < def.minLevel) {
    return {
      status: "locked_level",
      reason: `Reach level ${def.minLevel} to enter this sector.`,
      minLevel: def.minLevel,
      canEnter: false,
    }
  }

  const unlocked = player.progression.unlockedDungeons.includes(def.key)
  if (!unlocked) {
    const prereq = def.requiredDungeon
    const prereqLabel = prereq
      ? getDungeonDefinition(prereq).name
      : "prior extraction"
    return {
      status: "locked_prerequisite",
      reason: prereq
        ? `Extract rewards from ${prereqLabel} first.`
        : "This corridor is not registered yet.",
      minLevel: def.minLevel,
      canEnter: false,
    }
  }

  return {
    status: "available",
    reason: "",
    minLevel: def.minLevel,
    canEnter: true,
  }
}

export function canStartDungeon(
  player: PlayerContract,
  activeQuests: QuestContract[],
  dungeonKey: string
): { ok: boolean; reason?: string } {
  const access = resolveDungeonAccess(player, activeQuests, dungeonKey)
  if (!access.canEnter) {
    return { ok: false, reason: access.reason }
  }
  return { ok: true }
}

export { listAvailableDungeons }
