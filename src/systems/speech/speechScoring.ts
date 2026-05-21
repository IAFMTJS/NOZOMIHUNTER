import type { SpeechAnalysisContract } from "@/contracts/speech-contract"
import type { SpeechPhraseContract } from "@/contracts/encounter-contract"
import type { QuestDifficulty } from "@/contracts/quest-contract"
import { speechFeedbackLine } from "@/config/speechContentConfig"
import { speechPassThreshold } from "@/config/speechEncounterConfig"
import { scorePronunciation } from "./pronunciationScoring"
import { scoreHesitation } from "./hesitationDetection"
import { scoreConfidence } from "./confidenceScoring"
import { scoreResponseTiming } from "./timingAnalysis"

export interface SpeechScoreInput {
  transcript: string
  phrase: SpeechPhraseContract
  responseTimeMs: number
  difficulty: QuestDifficulty
}

export function buildCompositeScore(
  pronunciationScore: number,
  confidenceScore: number,
  timingScore: number,
  hesitationScore: number
): number {
  const base =
    pronunciationScore * 0.45 +
    confidenceScore * 0.3 +
    timingScore * 0.25
  const penalty = Math.min(30, hesitationScore * 0.35)
  return Math.round(Math.max(0, Math.min(100, base - penalty)))
}

export function scoreSpeechAttempt(input: SpeechScoreInput): SpeechAnalysisContract {
  const { transcript, phrase, responseTimeMs, difficulty } = input
  const detectedWords = transcript.split(/\s+/).filter(Boolean)
  const { score: pronunciationScore, mistakes } = scorePronunciation(
    transcript,
    phrase
  )
  const hesitationScore = scoreHesitation(transcript)
  const confidenceScore = scoreConfidence(transcript, hesitationScore)
  const timingScore = scoreResponseTiming(responseTimeMs)
  const compositeScore = buildCompositeScore(
    pronunciationScore,
    confidenceScore,
    timingScore,
    hesitationScore
  )
  const passed = compositeScore >= speechPassThreshold(difficulty)

  return {
    transcript,
    pronunciationScore,
    confidenceScore,
    hesitationScore,
    timingScore,
    compositeScore,
    passed,
    responseTimeMs,
    detectedWords,
    mistakes,
    feedback: speechFeedbackLine(compositeScore, passed),
  }
}

/** @deprecated Use scoreSpeechAttempt — kept for transcribe service compatibility */
export function scoreSpeechFromTranscript(
  transcript: string,
  expectedWords: string[] = [],
  responseTimeMs = 4000,
  difficulty: QuestDifficulty = "NORMAL"
): SpeechAnalysisContract {
  const phrase: SpeechPhraseContract = {
    id: "legacy",
    japanese: expectedWords[0] ?? "",
    reading: expectedWords[0] ?? "",
    romaji: expectedWords[1] ?? expectedWords[0] ?? "",
    meanings: expectedWords.slice(2),
  }
  return scoreSpeechAttempt({
    transcript,
    phrase,
    responseTimeMs,
    difficulty,
  })
}
