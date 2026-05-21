import { FEATURE_FLAGS } from "@/config/features"
import { scoreSpeechFromTranscript } from "@/systems/speech/speechScoring"
import type { SpeechAnalysisContract } from "@/contracts/speech-contract"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

/**
 * Whisper STT integration point. Pass audio buffer when API is configured.
 */
export async function transcribeAndAnalyze(
  audioBase64: string | null,
  fallbackTranscript: string,
  playerId: string,
  expectedWords?: string[]
): Promise<SpeechAnalysisContract> {
  if (!FEATURE_FLAGS.SPEECH_ANALYSIS) {
    throw new Error("Speech analysis disabled")
  }

  let transcript = fallbackTranscript

  if (audioBase64 && process.env.OPENAI_API_KEY) {
    // Future: OpenAI Whisper API call with audioBase64
    transcript = fallbackTranscript
  }

  const analysis = scoreSpeechFromTranscript(transcript, expectedWords)

  eventBus.emit(GAME_EVENTS.SPEECH_ANALYZED, {
    playerId,
    analysis,
  })

  return analysis
}
