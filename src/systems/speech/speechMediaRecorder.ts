import { pickSupportedMimeType } from "./audioFormatSystem"
import { getActiveMicrophoneStream } from "./microphoneSystem"
import { getRecordingSnapshot, markRecordingError } from "./recordingStateSystem"
import { logSpeechDebug } from "./speechDebugSystem"

let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []

export function resetRecordedChunks(): void {
  recordedChunks = []
}

export function startMediaRecorderCapture(): { ok: boolean; error?: string } {
  const stream = getActiveMicrophoneStream()
  if (!stream) {
    return { ok: false, error: "No microphone stream" }
  }

  const mimeType = pickSupportedMimeType()
  try {
    mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data)
    }
    mediaRecorder.onerror = () => {
      markRecordingError("Recorder error")
    }
    mediaRecorder.start(250)
    logSpeechDebug({
      snapshot: getRecordingSnapshot(),
      recorderState: mediaRecorder.state,
      micActive: true,
    })
    return { ok: true }
  } catch (e) {
    mediaRecorder = null
    const msg = e instanceof Error ? e.message : "Could not start recorder"
    markRecordingError(msg)
    return { ok: false, error: msg }
  }
}

export async function finalizeMediaRecorderBlob(): Promise<Blob | null> {
  const recorder = mediaRecorder
  mediaRecorder = null

  if (!recorder || recorder.state === "inactive") {
    if (recordedChunks.length === 0) return null
    const mime = recordedChunks[0]?.type || pickSupportedMimeType()
    return new Blob(recordedChunks, { type: mime })
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const mime = recorder.mimeType || pickSupportedMimeType()
      resolve(
        recordedChunks.length > 0
          ? new Blob(recordedChunks, { type: mime })
          : null
      )
    }
    try {
      recorder.stop()
    } catch {
      resolve(null)
    }
  })
}

export function stopMediaRecorderCapture(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try {
      mediaRecorder.stop()
    } catch {
      /* ignore */
    }
  }
  mediaRecorder = null
  recordedChunks = []
}
