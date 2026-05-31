import type { QuestContract } from "@/contracts/quest-contract"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { isKanjiSurgeryComplete } from "@/systems/training/kanjiSurgerySystem"

export class GameModeActionRejectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GameModeActionRejectedError"
  }
}

/**
 * Reject client-spoofed mode actions before mutating quest state.
 * Full server replay validation is tracked in migration 028.
 */
export function assertGameModeActionAllowed(
  quest: QuestContract,
  action: string,
  payload?: string
): void {
  const mode = resolveQuestGameMode(quest)

  if (action === "kanji-stabilize" && mode === "KANJI_SURGERY") {
    const [targetId, okRaw] = (payload ?? "").split(":")
    if (!targetId) {
      throw new GameModeActionRejectedError("Kanji target required.")
    }
    const target = quest.kanjiSurgeryEncounter?.find((t) => t.id === targetId)
    if (!target) {
      throw new GameModeActionRejectedError("Unknown kanji target.")
    }
    if (okRaw === "true" && target.stability >= 100) {
      throw new GameModeActionRejectedError("Target already stabilized.")
    }
    if (okRaw === "true" && isKanjiSurgeryComplete(quest.kanjiSurgeryEncounter ?? [])) {
      throw new GameModeActionRejectedError("Surgery already complete.")
    }
    return
  }

  if (action === "memory-intruder" && mode === "MEMORY_CASCADE") {
    if (!payload || !quest.memoryCascadeEncounter) {
      throw new GameModeActionRejectedError("Memory cascade payload required.")
    }
    return
  }
}
