import {
  getRecordingSnapshot,
  patchRecordingState,
  setTranscriptionStatus,
  setUploadStatus,
} from "./recordingStateSystem"
import { logSpeechDebug } from "./speechDebugSystem"

export interface ClientTranscriptionInput {
  blob: Blob | null
  sessionId: string
  clientTranscript: string
}

export interface ClientTranscriptionResult {
  ok: boolean
  transcript: string
  error?: string
}

const MIN_BLOB_BYTES = 32

/**
 * Resolves transcript from browser STT only — no server upload or paid APIs.
 */
export async function resolveClientTranscript(
  input: ClientTranscriptionInput
): Promise<ClientTranscriptionResult> {
  const transcript = input.clientTranscript.trim()

  setUploadStatus("idle")
  setTranscriptionStatus("processing")

  if (!transcript) {
    const hasAudio = input.blob && input.blob.size >= MIN_BLOB_BYTES
    if (hasAudio) {
      setTranscriptionStatus("failed")
      return {
        ok: false,
        transcript: "",
        error:
          "Audio captured but no speech recognized. Use Chrome/Edge, speak clearly, or type below.",
      }
    }
    setTranscriptionStatus("failed")
    return {
      ok: false,
      transcript: "",
      error: "No speech captured",
    }
  }

  setTranscriptionStatus("success")
  patchRecordingState({ uploadStatus: "success" })
  logSpeechDebug({
    snapshot: getRecordingSnapshot(),
    extra: `client stt (${input.sessionId})`,
  })

  return { ok: true, transcript }
}
