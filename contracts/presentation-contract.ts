/**
 * Presentation-only types: ceremony tiers and per-channel encounter feedback defaults.
 * Gameplay logic stays in systems; UI reads profiles via encounterFeedbackOrchestrator.
 * Flow map: flows/gamefeel-ceremonies.md
 */
import type { QuestNarrativeTier } from "./quest-contract"

/** Ceremony intensity mapped from quest narrative tier + dungeon flag. */
export type CompletionCeremonyTier = "light" | "medium" | "full" | "dungeon"

/** Encounter channel for feedback orchestration (extends quest channels). */
export type EncounterFeedbackChannel =
  | "DAILY"
  | "MAIN"
  | "SIDE"
  | "TRAINING"
  | "DUNGEON"

export type EncounterImpactLevel = "low" | "medium" | "high"

export type EncounterWrongAnswerFx = "subtle" | "glitch" | "corruption"

/** Per-channel defaults for encounter juice (presentation only). */
export interface EncounterFeedbackProfile {
  impactLevel: EncounterImpactLevel
  comboEnabled: boolean
  wrongAnswerFx: EncounterWrongAnswerFx
  /** Optional global freeze ms on major ceremony beats (0 = none). */
  ceremonyFreezeMs?: number
}

export const ENCOUNTER_FEEDBACK_BY_CHANNEL: Record<
  EncounterFeedbackChannel,
  EncounterFeedbackProfile
> = {
  DAILY: {
    impactLevel: "low",
    comboEnabled: true,
    wrongAnswerFx: "subtle",
    ceremonyFreezeMs: 0,
  },
  MAIN: {
    impactLevel: "medium",
    comboEnabled: true,
    wrongAnswerFx: "glitch",
    ceremonyFreezeMs: 0,
  },
  SIDE: {
    impactLevel: "medium",
    comboEnabled: true,
    wrongAnswerFx: "glitch",
    ceremonyFreezeMs: 0,
  },
  TRAINING: {
    impactLevel: "high",
    comboEnabled: true,
    wrongAnswerFx: "glitch",
    ceremonyFreezeMs: 0,
  },
  DUNGEON: {
    impactLevel: "high",
    comboEnabled: true,
    wrongAnswerFx: "corruption",
    ceremonyFreezeMs: 300,
  },
}

export function feedbackChannelFromNarrative(
  tier?: QuestNarrativeTier,
  opts?: { isDungeon?: boolean; isTraining?: boolean }
): EncounterFeedbackChannel {
  if (opts?.isDungeon) return "DUNGEON"
  if (opts?.isTraining) return "TRAINING"
  if (tier === "DAILY") return "DAILY"
  if (tier === "SIDE") return "SIDE"
  return "MAIN"
}

export function ceremonyTierFromNarrativeContract(
  tier?: QuestNarrativeTier,
  isDungeon?: boolean
): CompletionCeremonyTier {
  if (isDungeon) return "dungeon"
  if (tier === "DAILY") return "light"
  if (tier === "SIDE") return "medium"
  return "full"
}

/** Terminal copy for dungeon V2 consequences (presentation only). */
export const DUNGEON_CONSEQUENCE_COPY = {
  correct: "Seal confirmed. Entity staggered.",
  wrong: "Signal fractured. Corruption breach detected.",
  focus: "Focus channel opened. Corruption tax applied.",
  bossWhisper25: "Boss trace detected — distant whisper on the channel.",
  bossWhisper50: "Sector interrupt — warden proximity rising.",
  bossWhisper75: "Mini-boss signature — breach imminent.",
  bossWhisper100: "Forced warden encounter — no retreat lane.",
  routeGreedy: "Greedy route logged. Boss trace intensified.",
  extractionSafe: "Safe extraction authorized. Relics preserved.",
  extractionPush: "Deep push authorized. Bonus data at risk.",
} as const
