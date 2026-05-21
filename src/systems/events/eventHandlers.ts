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

  eventBus.on(GAME_EVENTS.QUEST_FAILED, (payload) => {
    logSystemEvent("quest", GAME_EVENTS.QUEST_FAILED, payload)
  })

  eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, (payload) => {
    logSystemEvent("penalty", GAME_EVENTS.PENALTY_TRIGGERED, payload)
  })

  eventBus.on(GAME_EVENTS.MESSAGE_RECEIVED, (payload) => {
    logSystemEvent("ai", GAME_EVENTS.MESSAGE_RECEIVED, payload)
  })

  eventBus.on(GAME_EVENTS.AI_RESPONSE_GENERATED, (payload) => {
    logSystemEvent("ai", GAME_EVENTS.AI_RESPONSE_GENERATED, payload)
  })

  eventBus.on(GAME_EVENTS.VOCABULARY_MASTERED, (payload) => {
    logSystemEvent("mastery", GAME_EVENTS.VOCABULARY_MASTERED, payload)
  })

  eventBus.on(GAME_EVENTS.SPEECH_RECORDED, (payload) => {
    logSystemEvent("speech", GAME_EVENTS.SPEECH_RECORDED, payload)
  })

  eventBus.on(GAME_EVENTS.SPEECH_ANALYZED, (payload) => {
    logSystemEvent("speech", GAME_EVENTS.SPEECH_ANALYZED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_ENTERED, (payload) => {
    logSystemEvent("dungeon", GAME_EVENTS.DUNGEON_ENTERED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_COMPLETED, (payload) => {
    logSystemEvent("dungeon", GAME_EVENTS.DUNGEON_COMPLETED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_FAILED, (payload) => {
    logSystemEvent("dungeon", GAME_EVENTS.DUNGEON_FAILED, payload)
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_STARTED, (payload) => {
    logSystemEvent("dungeon", GAME_EVENTS.ENCOUNTER_STARTED, payload)
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_COMPLETED, (payload) => {
    logSystemEvent("dungeon", GAME_EVENTS.ENCOUNTER_COMPLETED, payload)
  })
}
