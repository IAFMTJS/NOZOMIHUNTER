import { eventBus } from "./eventBus"
import { GAME_EVENTS } from "./eventTypes"
import { logSystemEvent } from "@/systems/logger/logger"

export function registerCoreEventHandlers(): void {
  eventBus.on(GAME_EVENTS.QUEST_COMPLETED, (payload) => {
    logSystemEvent("quest", GAME_EVENTS.QUEST_COMPLETED, payload)
  })

  eventBus.on(GAME_EVENTS.XP_GAINED, (payload) => {
    logSystemEvent("progression", GAME_EVENTS.XP_GAINED, payload)
  })

  eventBus.on(GAME_EVENTS.LEVEL_UP, (payload) => {
    logSystemEvent("progression", GAME_EVENTS.LEVEL_UP, payload)
  })

  eventBus.on(GAME_EVENTS.RANK_UP, (payload) => {
    logSystemEvent("progression", GAME_EVENTS.RANK_UP, payload)
  })

  eventBus.on(GAME_EVENTS.SAVE_TRIGGERED, (payload) => {
    logSystemEvent("save", GAME_EVENTS.SAVE_TRIGGERED, payload)
  })
}
