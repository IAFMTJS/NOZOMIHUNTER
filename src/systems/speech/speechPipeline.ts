import type { SpeechAnalysisContract } from "@/contracts/speech-contract"
import type { SpeechPhraseContract } from "@/contracts/encounter-contract"
import type { QuestDifficulty } from "@/contracts/quest-contract"
import { scoreSpeechAttempt } from "./speechScoring"

export interface SpeechPipelineInput {
  transcript: string
  phrase: SpeechPhraseContract
  responseTimeMs: number
  difficulty: QuestDifficulty
  startedAtMs?: number
}

export function runSpeechPipeline(
  input: SpeechPipelineInput
): SpeechAnalysisContract {
  const responseTimeMs =
    input.responseTimeMs > 0
      ? input.responseTimeMs
      : input.startedAtMs
        ? Math.max(0, Date.now() - input.startedAtMs)
        : 4000

  return scoreSpeechAttempt({
    transcript: input.transcript.trim(),
    phrase: input.phrase,
    responseTimeMs,
    difficulty: input.difficulty,
  })
}
