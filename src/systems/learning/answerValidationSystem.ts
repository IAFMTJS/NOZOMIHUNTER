import type {
  AnswerInputMode,
  ChallengePromptDirection,
} from "@/contracts/encounter-contract"
import {
  normalizeAnswer,
  normalizeJapanese,
  readingToRomaji,
} from "@/services/jmdict/normalize"
import { resolveInputMode } from "@/systems/learning/challengeDisplaySystem"

export interface AnswerableChallengeItem {
  japanese: string
  reading: string
  romaji: string
  meanings: string[]
  promptDirection?: ChallengePromptDirection
  inputMode?: AnswerInputMode
}

export function resolveAnswerInputMode(
  item: AnswerableChallengeItem,
  defaultDirection: ChallengePromptDirection
): AnswerInputMode {
  return (
    item.inputMode ??
    resolveInputMode(item.promptDirection ?? defaultDirection)
  )
}

export function buildAcceptedAnswers(
  item: AnswerableChallengeItem,
  defaultDirection: ChallengePromptDirection = "RETRIEVE_ENGLISH"
): Set<string> {
  const mode = resolveAnswerInputMode(item, defaultDirection)
  const accepted = new Set<string>()

  switch (mode) {
    case "english":
      item.meanings.forEach((m) => accepted.add(normalizeAnswer(m)))
      break
    case "romaji":
      accepted.add(normalizeAnswer(item.romaji))
      accepted.add(readingToRomaji(item.reading))
      break
    case "kana":
      accepted.add(normalizeJapanese(item.reading))
      break
    case "japanese":
      accepted.add(normalizeJapanese(item.japanese))
      accepted.add(normalizeJapanese(item.reading))
      break
  }
  return accepted
}

export function matchesChallengeAnswer(
  item: AnswerableChallengeItem,
  answer: string,
  defaultDirection: ChallengePromptDirection = "RETRIEVE_ENGLISH"
): boolean {
  const normalized = normalizeAnswer(answer)
  if (!normalized) return false

  const mode = resolveAnswerInputMode(item, defaultDirection)
  const accepted = buildAcceptedAnswers(item, defaultDirection)
  if (accepted.has(normalized)) return true

  if (mode === "english") {
    return false
  }
  if (mode === "japanese" || mode === "kana") {
    return accepted.has(normalizeJapanese(answer))
  }
  return accepted.has(normalized) || accepted.has(normalizeJapanese(answer))
}
