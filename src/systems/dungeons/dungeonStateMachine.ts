export type DungeonState =
  | "IDLE"
  | "PREPARATION"
  | "EXPLORATION"
  | "ENCOUNTER"
  | "REWARD"
  | "BOSS"
  | "EXTRACTION"
  | "COMPLETE"
  | "FAILURE"

const TRANSITIONS: Record<DungeonState, DungeonState[]> = {
  IDLE: ["PREPARATION"],
  PREPARATION: ["EXPLORATION"],
  EXPLORATION: ["ENCOUNTER"],
  ENCOUNTER: ["REWARD", "FAILURE"],
  REWARD: ["EXPLORATION", "BOSS"],
  BOSS: ["EXTRACTION", "FAILURE"],
  EXTRACTION: ["COMPLETE"],
  COMPLETE: [],
  FAILURE: ["IDLE"],
}

export function canTransition(
  from: DungeonState,
  to: DungeonState
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function transition(
  current: DungeonState,
  next: DungeonState
): DungeonState {
  if (!canTransition(current, next)) {
    throw new Error(`Invalid dungeon transition: ${current} -> ${next}`)
  }
  return next
}
