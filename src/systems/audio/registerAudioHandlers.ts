import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { playAudioCue, stopCorruptionHum } from "./audioSystem"
import { playThemedCue } from "./themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

let registered = false

export function registerAudioHandlers(): void {
  if (registered) return
  registered = true

  eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, () => {
    playAudioCue("confirm")
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, () => {
    playAudioCue("error")
  })

  eventBus.on(GAME_EVENTS.LEVEL_UP, () => {
    playAudioCue("levelUp")
  })

  eventBus.on(GAME_EVENTS.QUEST_COMPLETED, () => {
    playAudioCue("questComplete")
  })

  eventBus.on(GAME_EVENTS.QUEST_FAILED, () => {
    playAudioCue("error")
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_STARTED, () => {
    playAudioCue("encounterStart")
  })

  eventBus.on(GAME_EVENTS.ENCOUNTER_COMPLETED, () => {
    playAudioCue("sectorClear")
  })

  eventBus.on(GAME_EVENTS.DUNGEON_ENTERED, (payload) => {
    const p = payload as { theme?: DungeonTheme } | undefined
    if (p?.theme) {
      playThemedCue(p.theme, "enter")
    } else {
      playAudioCue("encounterStart")
    }
  })

  eventBus.on(GAME_EVENTS.DUNGEON_COMPLETED, () => {
    playAudioCue("questComplete")
  })

  eventBus.on(GAME_EVENTS.DUNGEON_FAILED, () => {
    playAudioCue("error")
  })

  eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, (payload) => {
    const p = payload as { corruption?: number } | undefined
    if (p && typeof p.corruption === "number" && p.corruption >= 25) {
      playAudioCue("corruption")
    } else {
      playAudioCue("error")
    }
  })

  eventBus.on(GAME_EVENTS.VOCABULARY_PREPARATION_READY, () => {
    playAudioCue("confirm")
  })
}

export const CORRUPTION_AUDIO_KEY = "nozomi-corruption-audio"

export function isCorruptionAudioEnabled(): boolean {
  if (typeof window === "undefined") return true
  try {
    const stored = localStorage.getItem(CORRUPTION_AUDIO_KEY)
    if (stored === null) return true
    return stored === "1"
  } catch {
    return true
  }
}

export function setCorruptionAudioEnabled(value: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CORRUPTION_AUDIO_KEY, value ? "1" : "0")
  } catch {
    /* ignore */
  }
  if (!value) stopCorruptionHum()
}

export function syncCorruptionAudio(corruption: number): void {
  if (!isCorruptionAudioEnabled()) {
    stopCorruptionHum()
    return
  }
  if (corruption >= 50) {
    playAudioCue("corruption")
  } else {
    stopCorruptionHum()
  }
}
