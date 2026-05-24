import type { SpeechMistakeContract } from "@/contracts/speech-contract"
import type { SpeechPhraseContract } from "@/contracts/encounter-contract"
import {
  normalizeAnswer,
  normalizeJapanese,
  normalizeRomaji,
} from "@/services/jmdict/normalize"

function transcriptTokens(transcript: string): string[] {
  return transcript
    .split(/[\s、。,.!?]+/)
    .map((t) => normalizeAnswer(t))
    .filter(Boolean)
}

function phraseAcceptanceSet(phrase: SpeechPhraseContract): Set<string> {
  const tokens = new Set<string>()
  tokens.add(normalizeRomaji(phrase.romaji))
  tokens.add(normalizeJapanese(phrase.japanese))
  tokens.add(normalizeJapanese(phrase.reading))
  for (const meaning of phrase.meanings) {
    tokens.add(normalizeAnswer(meaning))
  }
  return tokens
}

export function scorePronunciation(
  transcript: string,
  phrase: SpeechPhraseContract
): { score: number; mistakes: SpeechMistakeContract[] } {
  const normalizedTranscript = normalizeAnswer(transcript)
  const normalizedJapaneseTranscript = normalizeJapanese(transcript)
  const japanese = normalizeJapanese(phrase.japanese)
  const accepted = phraseAcceptanceSet(phrase)
  const tokens = transcriptTokens(transcript)

  const directHit =
    normalizedTranscript.includes(normalizeRomaji(phrase.romaji)) ||
    normalizedJapaneseTranscript.includes(japanese) ||
    japanese.includes(normalizedJapaneseTranscript) ||
    tokens.some((t) => accepted.has(t))

  if (directHit) {
    return { score: 100, mistakes: [] }
  }

  const partialHits = tokens.filter((t) => accepted.has(t)).length
  const romajiParts = normalizeRomaji(phrase.romaji).split(" ")
  const matchedParts = romajiParts.filter((part) =>
    normalizedTranscript.includes(part)
  ).length

  const partialRatio =
    romajiParts.length > 0 ? matchedParts / romajiParts.length : 0
  const score = Math.round(
    Math.min(85, partialHits * 25 + partialRatio * 60)
  )

  const mistakes: SpeechMistakeContract[] = [
    {
      word: phrase.japanese,
      issue: score > 0 ? "PRONUNCIATION" : "MISSING_WORD",
      severity: score > 0 ? 0.4 : 0.8,
    },
  ]

  return { score, mistakes }
}
