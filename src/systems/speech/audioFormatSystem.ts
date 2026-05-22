const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
] as const

export function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return "audio/webm"
  }
  for (const mime of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime
    }
  }
  return "audio/webm"
}

export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  )
}

export function isSecureSpeechContext(): boolean {
  if (typeof window === "undefined") return false
  return window.isSecureContext
}
