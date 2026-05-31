import type { DungeonRunContract } from "@/contracts/dungeon-contract"

export function isDungeonV2Run(run: DungeonRunContract): boolean {
  return run.runSchemaVersion === 2
}

export function resolveBossPhaseCount(run: DungeonRunContract): number {
  const specs = run.dungeon.boss?.phaseSpecs
  if (specs?.length) return specs.length
  return run.dungeon.boss?.phases ?? 2
}

/** STORY / RECOVERY / TREASURE rooms mount with activeType null. */
export function isSpecialRoomEncounter(run: DungeonRunContract): boolean {
  return (
    run.machineState === "ENCOUNTER" &&
    run.activeType === null &&
    Boolean(run.explorationSystemLine)
  )
}
