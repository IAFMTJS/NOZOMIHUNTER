import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { advanceObjective } from "@/systems/quests/questValidator"
import { getCurrentNode } from "./dungeonRouteSystem"
import type { MountContext } from "./dungeonEncounterFactory"

export const DUNGEON_OBJECTIVE_ID = "obj-dungeon"

export function patchRun(
  quest: QuestContract,
  run: DungeonRunContract
): QuestContract {
  if (!quest.dungeonRun) return quest
  return { ...quest, dungeonRun: run }
}

export function advanceDungeonObjective(quest: QuestContract): QuestContract {
  return {
    ...quest,
    objectives: advanceObjective(quest.objectives, DUNGEON_OBJECTIVE_ID, 1),
  }
}

export function markEncounterComplete(
  quest: QuestContract,
  encounterId: string
): QuestContract {
  const run = quest.dungeonRun!
  const encounters = run.dungeon.encounters.map((e) =>
    e.id === encounterId ? { ...e, completed: true } : e
  )
  return patchRun(quest, {
    ...run,
    dungeon: { ...run.dungeon, encounters },
  })
}

export function mountContextFromRun(
  run: DungeonRunContract,
  playerLevel: number
): MountContext {
  const node = getCurrentNode(run)
  return {
    sectorLabel: node?.label ?? "Sector",
    playerLevel,
    selectedAction: run.selectedDungeonAction,
    dungeonRun: run,
    nodeId: node?.id,
    dungeonKey: run.dungeon.id,
    roomType: node?.roomType,
    scenarioId: undefined,
  }
}
