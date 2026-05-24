import type {
  AnswerInputMode,
  ChallengeDisplayPhase,
  ChallengePromptDirection,
  ChallengeWordFields,
} from "@/contracts/encounter-contract"
import type { AssistLevel } from "@/contracts/game-mode-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"

export interface VisibleLayers {
  japanese: boolean
  reading: boolean
  romaji: boolean
  meaning: boolean
}

export function resolveVisibleLayers(
  direction: ChallengePromptDirection | null,
  phase: ChallengeDisplayPhase,
  assistLevel: AssistLevel,
  challengeMode: boolean
): VisibleLayers {
  if (!challengeMode || phase === "REVEALED") {
    return { japanese: true, reading: true, romaji: true, meaning: true }
  }

  if (!direction) {
    return { japanese: true, reading: true, romaji: true, meaning: false }
  }

  switch (direction) {
    case "RETRIEVE_ENGLISH":
      if (assistLevel === "BLACKOUT") {
        return { japanese: true, reading: false, romaji: false, meaning: false }
      }
      return {
        japanese: true,
        reading: assistLevel === "REDUCED" ? false : true,
        romaji: true,
        meaning: false,
      }
    case "RETRIEVE_JAPANESE":
    case "RETRIEVE_READING":
      return { japanese: false, reading: false, romaji: false, meaning: true }
    case "LISTEN_DECODE":
      return { japanese: false, reading: false, romaji: false, meaning: false }
    case "SPEAK_JAPANESE":
    case "SPEAK_FROM_PROMPT":
      return { japanese: false, reading: false, romaji: false, meaning: true }
    default:
      return { japanese: true, reading: true, romaji: true, meaning: false }
  }
}

export function pickPromptDirection(
  wordId: string,
  masteryScore: number,
  mode?: GameModeId
): ChallengePromptDirection {
  if (mode === "TERMINAL_BREACH") {
    return "RETRIEVE_JAPANESE"
  }
  if (mode === "SIGNAL_CALIBRATION" || mode === "LOST_TRANSMISSION") {
    return "LISTEN_DECODE"
  }
  if (mode === "SHADOW_ECHO") {
    return "SPEAK_JAPANESE"
  }

  const seed = wordId.charCodeAt(0) + (wordId.charCodeAt(wordId.length - 1) ?? 0)
  if (masteryScore >= 70) {
    return seed % 2 === 0 ? "RETRIEVE_JAPANESE" : "RETRIEVE_READING"
  }
  if (masteryScore >= 40) {
    return seed % 3 === 0 ? "RETRIEVE_JAPANESE" : "RETRIEVE_ENGLISH"
  }
  return "RETRIEVE_ENGLISH"
}

export function resolveInputMode(
  direction: ChallengePromptDirection
): AnswerInputMode {
  switch (direction) {
    case "RETRIEVE_ENGLISH":
      return "english"
    case "RETRIEVE_JAPANESE":
      return "japanese"
    case "RETRIEVE_READING":
      return "romaji"
    case "LISTEN_DECODE":
      return "romaji"
    case "SPEAK_JAPANESE":
    case "SPEAK_FROM_PROMPT":
      return "japanese"
    default:
      return "english"
  }
}

export function inputModeLabel(mode: AnswerInputMode): string {
  switch (mode) {
    case "english":
      return "Transmit meaning (English)"
    case "romaji":
      return "Transmit reading (romaji)"
    case "kana":
      return "Transmit reading (kana)"
    case "japanese":
      return "Transmit Japanese"
  }
}

export function inputModePlaceholder(mode: AnswerInputMode): string {
  switch (mode) {
    case "english":
      return "e.g. water"
    case "romaji":
      return "e.g. mizu"
    case "kana":
      return "e.g. みず"
    case "japanese":
      return "e.g. 水"
  }
}

export function attachChallengeFields<T extends { id: string }>(
  word: T,
  masteryScore: number,
  directionOverride?: ChallengePromptDirection,
  mode?: GameModeId
): T & ChallengeWordFields {
  const promptDirection =
    directionOverride ?? pickPromptDirection(word.id, masteryScore, mode)
  return {
    ...word,
    promptDirection,
    inputMode: resolveInputMode(promptDirection),
  }
}

export function defaultListeningDirection(): ChallengePromptDirection {
  return "LISTEN_DECODE"
}

export function defaultSpeechDirection(): ChallengePromptDirection {
  return "SPEAK_JAPANESE"
}
