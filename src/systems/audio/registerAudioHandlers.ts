import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import {
  playAudioCue,
  startCorruptionHum,
  stopCorruptionHum,
  stopRunAudio,
} from "./audioSystem"
import { playCategoryStem } from "./audioCategorySystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

let registered = false
let unregister: (() => void) | null = null

export function registerAudioHandlers(): () => void {
  if (registered && unregister) return unregister
  registered = true

  const onLevelUp = () => {
    /* LevelUpCeremony plays full sting */
  }
  const onQuestComplete = () => playCategoryStem("contract")
  const onAchievement = () => playCategoryStem("relic_drop")
  const onMasteryTier = () => {
    /* MasteryTierUpCeremony plays confirm */
  }
  const onQuestFailed = () => playAudioCue("error")
  const onEncounterStart = () => playCategoryStem("training")
  const onEncounterComplete = () => playCategoryStem("sector_clear")
  const onEncounterCorrect = () => playAudioCue("confirm")
  const onEncounterWrong = () => playAudioCue("error")
  const onDungeonEntered = (payload: unknown) => {
    const p = payload as { theme?: DungeonTheme } | undefined
    playCategoryStem("dungeon_enter", p?.theme)
  }
  const onDungeonCompleted = () => {
    stopRunAudio()
    playAudioCue("questComplete")
  }
  const onDungeonFailed = () => {
    stopRunAudio()
    playAudioCue("error")
  }
  const onPenalty = (payload: unknown) => {
    const p = payload as { corruption?: number } | undefined
    if (p && typeof p.corruption === "number" && p.corruption >= 25) {
      playCategoryStem("corruption_alert")
    } else {
      playAudioCue("error")
    }
  }
  const onPrepReady = () => playCategoryStem("training")
  const onRankUp = () => playCategoryStem("rank_up")
  const onAnomaly = () => playCategoryStem("corruption_alert")
  const onArchiveUnlock = () => playCategoryStem("relic_drop")
  const onBossPhase = () => playCategoryStem("boss")
  const onWordBound = () => playAudioCue("rewardCascade")

  eventBus.on(GAME_EVENTS.LEVEL_UP, onLevelUp)
  eventBus.on(GAME_EVENTS.QUEST_COMPLETED, onQuestComplete)
  eventBus.on(GAME_EVENTS.QUEST_FAILED, onQuestFailed)
  eventBus.on(GAME_EVENTS.ENCOUNTER_STARTED, onEncounterStart)
  eventBus.on(GAME_EVENTS.ENCOUNTER_COMPLETED, onEncounterComplete)
  eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, onEncounterCorrect)
  eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, onEncounterWrong)
  eventBus.on(GAME_EVENTS.SECTOR_CLEARED, onEncounterComplete)
  eventBus.on(GAME_EVENTS.DUNGEON_ENTERED, onDungeonEntered)
  eventBus.on(GAME_EVENTS.DUNGEON_COMPLETED, onDungeonCompleted)
  eventBus.on(GAME_EVENTS.DUNGEON_FAILED, onDungeonFailed)
  eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, onPenalty)
  eventBus.on(GAME_EVENTS.VOCABULARY_PREPARATION_READY, onPrepReady)
  eventBus.on(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement)
  eventBus.on(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
  eventBus.on(GAME_EVENTS.DAILY_MILESTONE_REACHED, onQuestComplete)
  eventBus.on(GAME_EVENTS.RANK_UP, onRankUp)
  eventBus.on(GAME_EVENTS.LANGUAGE_INVASION_ACTIVE, onAnomaly)
  eventBus.on(GAME_EVENTS.ARCHIVE_UNLOCKED, onArchiveUnlock)
  eventBus.on(GAME_EVENTS.BOSS_PHASE_CHANGED, onBossPhase)
  eventBus.on(GAME_EVENTS.WORD_BOUND, onWordBound)

  unregister = () => {
    eventBus.off(GAME_EVENTS.LEVEL_UP, onLevelUp)
    eventBus.off(GAME_EVENTS.QUEST_COMPLETED, onQuestComplete)
    eventBus.off(GAME_EVENTS.QUEST_FAILED, onQuestFailed)
    eventBus.off(GAME_EVENTS.ENCOUNTER_STARTED, onEncounterStart)
    eventBus.off(GAME_EVENTS.ENCOUNTER_COMPLETED, onEncounterComplete)
    eventBus.off(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, onEncounterCorrect)
    eventBus.off(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, onEncounterWrong)
    eventBus.off(GAME_EVENTS.DUNGEON_ENTERED, onDungeonEntered)
    eventBus.off(GAME_EVENTS.DUNGEON_COMPLETED, onDungeonCompleted)
    eventBus.off(GAME_EVENTS.DUNGEON_FAILED, onDungeonFailed)
    eventBus.off(GAME_EVENTS.PENALTY_TRIGGERED, onPenalty)
    eventBus.off(GAME_EVENTS.VOCABULARY_PREPARATION_READY, onPrepReady)
    eventBus.off(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement)
    eventBus.off(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
    eventBus.off(GAME_EVENTS.DAILY_MILESTONE_REACHED, onQuestComplete)
    eventBus.off(GAME_EVENTS.RANK_UP, onRankUp)
    eventBus.off(GAME_EVENTS.LANGUAGE_INVASION_ACTIVE, onAnomaly)
    eventBus.off(GAME_EVENTS.ARCHIVE_UNLOCKED, onArchiveUnlock)
    eventBus.off(GAME_EVENTS.BOSS_PHASE_CHANGED, onBossPhase)
    eventBus.off(GAME_EVENTS.WORD_BOUND, onWordBound)
    eventBus.off(GAME_EVENTS.SECTOR_CLEARED, onEncounterComplete)
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
  // Global player corruption only clears the hum; starting it is dungeon-scoped
  // so wrong answers during training/home do not leave a looping drone.
  if (corruption < 50) {
    stopCorruptionHum()
  }
}

/** Drive the persistent corruption hum from active dungeon threat pressure. */
export function syncDungeonCorruptionAudio(corruptionPressure: number): void {
  if (!isCorruptionAudioEnabled()) {
    stopCorruptionHum()
    return
  }
  if (corruptionPressure >= 50) {
    startCorruptionHum()
  } else {
    stopCorruptionHum()
  }
}
