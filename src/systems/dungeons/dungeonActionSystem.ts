import type { DungeonAction, DungeonRunContract } from "@/contracts/dungeon-contract"
import type { ChallengePromptDirection } from "@/contracts/encounter-contract"
import { applyFocusCost } from "./dungeonThreatSystem"

export function unlockedActionsForLevel(level: number): DungeonAction[] {
  if (level < 3) return ["STRIKE"]
  if (level < 5) return ["STRIKE", "SEAL"]
  return ["STRIKE", "SEAL", "COUNTER", "FOCUS"]
}

export function resolveActionToDirection(
  action: DungeonAction
): ChallengePromptDirection {
  switch (action) {
    case "STRIKE":
      return "RETRIEVE_ENGLISH"
    case "SEAL":
      return "RETRIEVE_READING"
    case "COUNTER":
      return "RETRIEVE_JAPANESE"
    case "ECHO":
      return "LISTEN_DECODE"
    case "FOCUS":
      return "RETRIEVE_ENGLISH"
    case "TRACE":
      return "RETRIEVE_JAPANESE"
    default:
      return "RETRIEVE_ENGLISH"
  }
}

export function selectDungeonAction(
  run: DungeonRunContract,
  action: DungeonAction,
  playerLevel: number
): { run: DungeonRunContract; error?: string } {
  const allowed = unlockedActionsForLevel(playerLevel)
  if (!allowed.includes(action)) {
    return { run, error: "Combat action locked for your rank." }
  }
  let next: DungeonRunContract = { ...run, selectedDungeonAction: action }
  if (action === "FOCUS") {
    next = applyFocusCost(next)
  }
  return { run: next }
}

export function defaultActionForLevel(level: number): DungeonAction {
  return unlockedActionsForLevel(level)[0] ?? "STRIKE"
}
