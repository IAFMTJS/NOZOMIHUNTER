import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { playAudioCue, stopCorruptionHum } from "./audioSystem"
import { playThemedCue } from "./themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

let registered = false
let unregister: (() => void) | null = null

export function registerAudioHandlers(): () => void {
  if (registered && unregister) return unregister
  registered = true

  const onLevelUp = () => {
    /* LevelUpCeremony plays full sting */
  }
  const onQuestComplete = () => playAudioCue("rewardCascade")
  const onAchievement = () => playAudioCue("achievement")
  const onMasteryTier = () => {
    /* MasteryTierUpCeremony plays confirm */
  }
  const onQuestFailed = () => playAudioCue("error")
  const onEncounterStart = () => playAudioCue("encounterStart")
  const onEncounterComplete = () => playAudioCue("sectorClear")
  const onDungeonEntered = (payload: unknown) => {
    const p = payload as { theme?: DungeonTheme } | undefined
    if (p?.theme) {
      playThemedCue(p.theme, "enter")
    } else {
      playAudioCue("encounterStart")
    }
  }
  const onDungeonCompleted = () => playAudioCue("questComplete")
  const onDungeonFailed = () => playAudioCue("error")
  const onPenalty = (payload: unknown) => {
    const p = payload as { corruption?: number } | undefined
    if (p && typeof p.corruption === "number" && p.corruption >= 25) {
      playAudioCue("corruption")
    } else {
      playAudioCue("error")
    }
  }
  const onPrepReady = () => playAudioCue("confirm")

  eventBus.on(GAME_EVENTS.LEVEL_UP, onLevelUp)
  eventBus.on(GAME_EVENTS.QUEST_COMPLETED, onQuestComplete)
  eventBus.on(GAME_EVENTS.QUEST_FAILED, onQuestFailed)
  eventBus.on(GAME_EVENTS.ENCOUNTER_STARTED, onEncounterStart)
  eventBus.on(GAME_EVENTS.ENCOUNTER_COMPLETED, onEncounterComplete)
  eventBus.on(GAME_EVENTS.DUNGEON_ENTERED, onDungeonEntered)
  eventBus.on(GAME_EVENTS.DUNGEON_COMPLETED, onDungeonCompleted)
  eventBus.on(GAME_EVENTS.DUNGEON_FAILED, onDungeonFailed)
  eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, onPenalty)
  eventBus.on(GAME_EVENTS.VOCABULARY_PREPARATION_READY, onPrepReady)
  eventBus.on(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement)
  eventBus.on(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)

  unregister = () => {
    eventBus.off(GAME_EVENTS.LEVEL_UP, onLevelUp)
    eventBus.off(GAME_EVENTS.QUEST_COMPLETED, onQuestComplete)
    eventBus.off(GAME_EVENTS.QUEST_FAILED, onQuestFailed)
    eventBus.off(GAME_EVENTS.ENCOUNTER_STARTED, onEncounterStart)
    eventBus.off(GAME_EVENTS.ENCOUNTER_COMPLETED, onEncounterComplete)
    eventBus.off(GAME_EVENTS.DUNGEON_ENTERED, onDungeonEntered)
    eventBus.off(GAME_EVENTS.DUNGEON_COMPLETED, onDungeonCompleted)
    eventBus.off(GAME_EVENTS.DUNGEON_FAILED, onDungeonFailed)
    eventBus.off(GAME_EVENTS.PENALTY_TRIGGERED, onPenalty)
    eventBus.off(GAME_EVENTS.VOCABULARY_PREPARATION_READY, onPrepReady)
    eventBus.off(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement)
    eventBus.off(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
    registered = false
    unregister = null
  }

  return unregister
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
