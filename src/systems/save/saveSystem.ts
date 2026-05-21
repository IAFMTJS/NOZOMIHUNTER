import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"

export interface PlayerSavePayload {
  player: PlayerContract
  activeQuests: QuestContract[]
}

export type SaveHandler = (payload: PlayerSavePayload) => Promise<void>

let saveHandler: SaveHandler | null = null

export function registerSaveHandler(handler: SaveHandler): void {
  saveHandler = handler
}

export async function triggerSave(payload: PlayerSavePayload): Promise<void> {
  eventBus.emit(GAME_EVENTS.SAVE_TRIGGERED, { playerId: payload.player.id })

  if (!saveHandler) return

  await saveHandler(payload)
  eventBus.emit(GAME_EVENTS.AUTOSAVE_COMPLETED, { playerId: payload.player.id })
}
