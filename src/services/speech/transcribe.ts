import { FEATURE_FLAGS } from "@/config/features"
import type { SpeechAnalysisContract } from "@/contracts/speech-contract"
import type { SpeechPhraseContract } from "@/contracts/encounter-contract"
import type { QuestDifficulty } from "@/contracts/quest-contract"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { runSpeechPipeline } from "@/systems/speech/speechPipeline"
import { canSubmitSpeech } from "@/systems/antiExploit/speechGuard"
import { checkSpeechRateLimitServer } from "@/services/supabase/progressionRepository"

export interface TranscribeAndAnalyzeInput {
  transcript: string
  playerId: string
  phrase: SpeechPhraseContract
  responseTimeMs: number
  difficulty: QuestDifficulty
}

/**
 * Free speech pipeline — scoring runs in systems; STT comes from the client
 * (Web Speech API or typed transcript). No paid Whisper/OpenAI calls.
 */
export async function transcribeAndAnalyze(
  input: TranscribeAndAnalyzeInput
): Promise<SpeechAnalysisContract> {
  if (!FEATURE_FLAGS.SPEECH_ANALYSIS) {
    throw new Error("Speech analysis disabled")
  }

  if (!canSubmitSpeech(input.playerId)) {
    throw new Error("Speech rate limit — slow down before transmitting again")
  }

  const serverOk = await checkSpeechRateLimitServer()
  if (!serverOk) {
    throw new Error("Speech rate limit — slow down before transmitting again")
  }

  const analysis = runSpeechPipeline({
    transcript: input.transcript,
    phrase: input.phrase,
    responseTimeMs: input.responseTimeMs,
    difficulty: input.difficulty,
  })

  eventBus.emit(GAME_EVENTS.SPEECH_RECORDED, {
    playerId: input.playerId,
    transcript: analysis.transcript,
  })

  eventBus.emit(GAME_EVENTS.SPEECH_ANALYZED, {
    playerId: input.playerId,
    analysis,
  })

  return analysis
}
