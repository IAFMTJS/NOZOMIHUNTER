import { eventBus } from "./eventBus"
import { GAME_EVENTS } from "./eventTypes"
import { logSystemEvent } from "@/systems/logger/logger"
import { recordAnalyticsEvent } from "@/systems/analytics/analyticsSystem"
import { registerAudioHandlers } from "@/systems/audio/registerAudioHandlers"

function track<T>(event: (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS], payload: T): void {
  logSystemEvent("event", event, payload)
  recordAnalyticsEvent(event, payload)
}

export function registerCoreEventHandlers(): void {
  registerAudioHandlers()

  eventBus.on(GAME_EVENTS.QUEST_COMPLETED, (payload) => {
    track(GAME_EVENTS.QUEST_COMPLETED, payload)
  })

  eventBus.on(GAME_EVENTS.XP_GAINED, (payload) => {
    track(GAME_EVENTS.XP_GAINED, payload)
  })

  eventBus.on(GAME_EVENTS.LEVEL_UP, (payload) => {
    track(GAME_EVENTS.LEVEL_UP, payload)
  })

  eventBus.on(GAME_EVENTS.RANK_UP, (payload) => {
    track(GAME_EVENTS.RANK_UP, payload)
  })

  eventBus.on(GAME_EVENTS.UNLOCK_GRANTED, (payload) => {
    track(GAME_EVENTS.UNLOCK_GRANTED, payload)
  })

  eventBus.on(GAME_EVENTS.SAVE_TRIGGERED, (payload) => {
    track(GAME_EVENTS.SAVE_TRIGGERED, payload)
  })

  eventBus.on(GAME_EVENTS.QUEST_FAILED, (payload) => {
    track(GAME_EVENTS.QUEST_FAILED, payload)
  })

  eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, (payload) => {
    track(GAME_EVENTS.PENALTY_TRIGGERED, payload)
  })

  eventBus.on(GAME_EVENTS.MESSAGE_RECEIVED, (payload) => {
    track(GAME_EVENTS.MESSAGE_RECEIVED, payload)
  })

  eventBus.on(GAME_EVENTS.AI_RESPONSE_GENERATED, (payload) => {
    track(GAME_EVENTS.AI_RESPONSE_GENERATED, payload)
  })

  eventBus.on(GAME_EVENTS.VOCABULARY_MASTERED, (payload) => {
    track(GAME_EVENTS.VOCABULARY_MASTERED, payload)
  })

  eventBus.on(GAME_EVENTS.VOCABULARY_PREPARATION_READY, (payload) => {
    track(GAME_EVENTS.VOCABULARY_PREPARATION_READY, payload)
  })

  eventBus.on(GAME_EVENTS.SPEECH_RECORDED, (payload) => {
    track(GAME_EVENTS.SPEECH_RECORDED, payload)
  })

  eventBus.on(GAME_EVENTS.SPEECH_ANALYZED, (payload) => {
    track(GAME_EVENTS.SPEECH_ANALYZED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_ENTERED, (payload) => {
    track(GAME_EVENTS.DUNGEON_ENTERED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_COMPLETED, (payload) => {
    track(GAME_EVENTS.DUNGEON_COMPLETED, payload)
  })

  eventBus.on(GAME_EVENTS.DUNGEON_FAILED, (payload) => {
    track(GAME_EVENTS.DUNGEON_FAILED, payload)
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_STARTED, (payload) => {
    track(GAME_EVENTS.ENCOUNTER_STARTED, payload)
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_COMPLETED, (payload) => {
    track(GAME_EVENTS.ENCOUNTER_COMPLETED, payload)
  })

  eventBus.on(GAME_EVENTS.QUEST_ACCEPTED, (payload) => {
    track(GAME_EVENTS.QUEST_ACCEPTED, payload)
  })

  eventBus.on(GAME_EVENTS.STAMINA_SPENT, (payload) => {
    track(GAME_EVENTS.STAMINA_SPENT, payload)
  })

  eventBus.on(GAME_EVENTS.ITEM_GRANTED, (payload) => {
    track(GAME_EVENTS.ITEM_GRANTED, payload)
  })

  eventBus.on(GAME_EVENTS.REWARDS_PENDING, (payload) => {
    track(GAME_EVENTS.REWARDS_PENDING, payload)
  })

  eventBus.on(GAME_EVENTS.REWARDS_CLAIMED, (payload) => {
    track(GAME_EVENTS.REWARDS_CLAIMED, payload)
  })

  eventBus.on(GAME_EVENTS.WORD_BREWED, (payload) => {
    track(GAME_EVENTS.WORD_BREWED, payload)
  })

  eventBus.on(GAME_EVENTS.QUEST_TRACKED, (payload) => {
    track(GAME_EVENTS.QUEST_TRACKED, payload)
  })
}
