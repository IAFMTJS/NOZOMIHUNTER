import {
  startLiveRecognition,
  type LiveRecognitionSession,
  type SpeechRecognitionLang,
  isBrowserSpeechRecognitionSupported,
} from "./browserSpeechRecognitionSystem"
import { getRecordingSnapshot } from "./recordingStateSystem"
import { logSpeechDebug } from "./speechDebugSystem"

let liveRecognition: LiveRecognitionSession | null = null
let liveTranscript = ""

export function getLiveTranscript(): string {
  return liveTranscript
}

export function setLiveTranscript(text: string): void {
  liveTranscript = text
}

export function clearLiveTranscript(): void {
  liveTranscript = ""
}

export function startSpeechLiveRecognition(
  lang: SpeechRecognitionLang,
  onTranscript: (text: string) => void
): void {
  if (!isBrowserSpeechRecognitionSupported()) return

  liveRecognition = startLiveRecognition(
    lang,
    (text) => {
      liveTranscript = text
      onTranscript(text)
    },
    (message) => {
      if (message) {
        logSpeechDebug({
          snapshot: getRecordingSnapshot(),
          extra: message,
        })
      }
    }
  )
}

export async function stopSpeechLiveRecognition(): Promise<string> {
  if (!liveRecognition) return liveTranscript
  const text = await liveRecognition.stop()
  liveRecognition = null
  return text
}

export function abortSpeechLiveRecognition(): void {
  liveRecognition?.abort()
  liveRecognition = null
}
