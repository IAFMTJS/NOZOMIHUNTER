import type { DungeonRunContract } from "@/contracts/dungeon-contract"

export function scoreSectorClear(run: DungeonRunContract): DungeonRunContract {
  const bonus = run.threat?.hunterFocus
    ? Math.floor(run.threat.hunterFocus / 10)
    : 0
  return {
    ...run,
    runScore: (run.runScore ?? 0) + 25 + bonus,
  }
}

export function scoreBossPhaseClear(run: DungeonRunContract): DungeonRunContract {
  return {
    ...run,
    runScore: (run.runScore ?? 0) + 40,
  }
}

export function scoreExtractionChoice(
  run: DungeonRunContract,
  push: boolean
): DungeonRunContract {
  const delta = push ? 35 : 20
  return {
    ...run,
    runScore: (run.runScore ?? 0) + delta,
  }
}
