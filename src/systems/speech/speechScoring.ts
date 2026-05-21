import type { SpeechAnalysisContract } from "@/contracts/speech-contract"

export function scoreSpeechFromTranscript(
  transcript: string,
  expectedWords: string[] = []
): SpeechAnalysisContract {
  const detectedWords = transcript.split(/\s+/).filter(Boolean)
  const mistakes = expectedWords
    .filter((w) => !transcript.includes(w))
    .map((word) => ({
      word,
      issue: "MISSING_WORD" as const,
      severity: 0.5,
    }))

  const pronunciationScore = Math.max(
    0,
    100 - mistakes.length * 15
  )
  const confidenceScore = Math.min(100, transcript.length * 2)
  const hesitationScore = (transcript.match(/\.{2,}|えっと|um/gi) ?? [])
    .length * 10

  return {
    transcript,
    pronunciationScore,
    confidenceScore: Math.max(0, confidenceScore - hesitationScore),
    hesitationScore,
    detectedWords,
    mistakes,
  }
}
