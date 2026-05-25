import type { AudioCueId } from "@/systems/audio/audioSystem"
import {
  ENCOUNTER_FEEDBACK_BY_CHANNEL,
  feedbackChannelFromNarrative,
  type EncounterFeedbackChannel,
} from "@/contracts/presentation-contract"
import type { QuestNarrativeTier } from "@/contracts/quest-contract"
import { isComboMilestone } from "@/systems/learning/encounterPressureSystem"

export type EncounterAnswerOutcome = "correct" | "wrong" | "combo_break"

export interface EncounterFeedbackInput {
  channel?: EncounterFeedbackChannel
  narrativeTier?: QuestNarrativeTier
  isDungeon?: boolean
  isTraining?: boolean
  outcome: EncounterAnswerOutcome
  correctStreak?: number
  previousStreak?: number
}

export interface EncounterFeedbackResult {
  cssClasses: string[]
  audioCues: AudioCueId[]
  hapticMs?: number
  freezeMs?: number
}

export function resolveEncounterChannel(
  input: Pick<
    EncounterFeedbackInput,
    "channel" | "narrativeTier" | "isDungeon" | "isTraining"
  >
): EncounterFeedbackChannel {
  if (input.channel) return input.channel
  return feedbackChannelFromNarrative(input.narrativeTier, {
    isDungeon: input.isDungeon,
    isTraining: input.isTraining,
  })
}

export function orchestrateEncounterFeedback(
  input: EncounterFeedbackInput
): EncounterFeedbackResult {
  const channel = resolveEncounterChannel(input)
  const profile = ENCOUNTER_FEEDBACK_BY_CHANNEL[channel]
  const cssClasses: string[] = []
  const audioCues: AudioCueId[] = []
  let hapticMs: number | undefined
  let freezeMs = profile.ceremonyFreezeMs ?? 0

  if (input.outcome === "correct") {
    cssClasses.push("nozomi-feedback-flash--success")
    if (profile.impactLevel === "high") {
      cssClasses.push("nozomi-combo-burst")
    }
    audioCues.push("confirm")
    const streak = input.correctStreak ?? 0
    if (profile.comboEnabled && isComboMilestone(streak)) {
      audioCues.push(streak >= 5 ? "combo5" : "combo2")
      if (streak >= 5) hapticMs = 25
    }
  } else {
    const prev = input.previousStreak ?? 0
    if (prev >= 3) {
      cssClasses.push("nozomi-encounter-glitch")
      audioCues.push("comboBreak")
      hapticMs = 30
    } else {
      audioCues.push("error")
    }
    if (profile.wrongAnswerFx === "corruption") {
      cssClasses.push("nozomi-feedback-flash--danger", "nozomi-dungeon-unstable")
      audioCues.push("corruption")
    } else if (profile.wrongAnswerFx === "glitch") {
      cssClasses.push("nozomi-encounter-glitch", "nozomi-feedback-flash--danger")
    } else {
      cssClasses.push("nozomi-feedback-flash--danger")
    }
  }

  if (channel === "DUNGEON") {
    if (input.outcome === "wrong") {
      freezeMs =
        profile.wrongAnswerFx === "corruption" ? 120 : 0
    } else {
      const streak = input.correctStreak ?? 0
      freezeMs =
        isComboMilestone(streak) || streak >= 3
          ? profile.ceremonyFreezeMs ?? 0
          : 0
    }
  }

  return { cssClasses, audioCues, hapticMs, freezeMs: freezeMs || undefined }
}
