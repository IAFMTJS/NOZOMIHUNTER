import type { DungeonMachineState } from "@/contracts/dungeon-contract"

const TRANSITIONS: Record<DungeonMachineState, DungeonMachineState[]> = {
  PREPARATION: ["EXPLORATION"],
  EXPLORATION: ["ENCOUNTER", "BOSS"],
  ENCOUNTER: ["REWARD", "FAILURE", "EXPLORATION"],
  REWARD: ["EXPLORATION", "BOSS"],
  BOSS: ["EXTRACTION", "FAILURE", "EXPLORATION"],
  EXTRACTION: ["COMPLETE"],
  COMPLETE: [],
  FAILURE: ["PREPARATION"],
}

export function canTransition(
  from: DungeonMachineState,
  to: DungeonMachineState
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function transition(
  current: DungeonMachineState,
  next: DungeonMachineState
): DungeonMachineState {
  if (!canTransition(current, next)) {
    throw new Error(`Invalid dungeon transition: ${current} -> ${next}`)
  }
  return next
}
