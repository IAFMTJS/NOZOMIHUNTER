import type { ChallengePromptDirection } from "@/contracts/encounter-contract"
import type { AssistLevel } from "@/contracts/game-mode-contract"

/** Staged learning support — recognition before independent recall. */
export type HintLearningStage =
  | "EXPOSURE"
  | "RECOGNITION"
  | "ASSISTED_RECALL"
  | "PRESSURE"

export type CompanionWhisperKind =
  | "PATTERN"
  | "REPEAT_EXPOSURE"
  | "PROMPT_NUDGE"
  | "FAILURE_REINFORCE"
  | "RADICAL"

export interface CompanionWhisperContract {
  kind: CompanionWhisperKind
  line: string
}

/** Layers briefly exposed while Hunter Vision is active. */
export interface HunterVisionRevealContract {
  reading: boolean
  romaji: boolean
  meaning: boolean
  radicalNote: string | null
}

export interface HintWordContextContract {
  wordId: string
  japanese: string
  reading: string
  romaji: string
  meaning: string
  masteryScore: number
  wrongAttempts: number
  promptDirection: ChallengePromptDirection
}

export interface HintSessionLimitsContract {
  whispersRemaining: number
  visionChargesRemaining: number
  whispersBlocked: boolean
  visionBlocked: boolean
}

export interface HintPolicyInput {
  assistLevel: AssistLevel
  whispersUsed: number
  visionChargesUsed: number
}
