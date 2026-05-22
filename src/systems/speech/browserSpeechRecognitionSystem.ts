export type SpeechRecognitionLang = "ja-JP" | "en-US"

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionResultEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  [index: number]: { transcript: string; confidence: number }
}

export function getBrowserRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  if (!window.isSecureContext) return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  return getBrowserRecognitionCtor() !== null
}

export function formatSpeechRecognitionError(
  code: string,
  lang: SpeechRecognitionLang
): string {
  switch (code) {
    case "not-allowed":
      return "Speech blocked. Allow microphone in the browser bar, then reload."
    case "no-speech":
      return lang === "ja-JP"
        ? "No Japanese detected. Try Romaji mode, speak louder, or type below."
        : "No speech detected. Speak the romaji line clearly or type below."
    case "audio-capture":
      return "No microphone input. Check your device input settings."
    case "network":
      return "Speech needs internet (Chrome sends audio to Google). Check connection."
    case "aborted":
      return ""
    case "service-not-allowed":
      return "Speech service blocked. Disable extensions/VPN or use typed fallback."
    default:
      return code ? `Voice error: ${code}` : ""
  }
}

export interface LiveRecognitionSession {
  stop(): Promise<string>
  abort(): void
  getTranscript(): string
}

export function startLiveRecognition(
  lang: SpeechRecognitionLang,
  onTranscript: (text: string) => void,
  onError?: (message: string) => void
): LiveRecognitionSession | null {
  const Ctor = getBrowserRecognitionCtor()
  if (!Ctor) return null

  let finalText = ""
  let interimText = ""
  let recognition: SpeechRecognitionInstance | null = null
  let resolver: ((text: string) => void) | null = null
  let wantActive = true
  let manualStop = false

  const sync = () => {
    onTranscript((finalText + interimText).trim())
  }

  recognition = new Ctor()
  recognition.lang = lang
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    interimText = ""
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const piece = result[0]?.transcript ?? ""
      if (result.isFinal) finalText += piece
      else interimText += piece
    }
    sync()
  }

  recognition.onerror = (evt) => {
    const message = formatSpeechRecognitionError(evt.error, lang)
    if (message) onError?.(message)
    if (evt.error !== "aborted" && evt.error !== "no-speech") {
      wantActive = false
      manualStop = true
    }
  }

  recognition.onend = () => {
    if (wantActive && !manualStop && recognition) {
      try {
        recognition.start()
        return
      } catch {
        /* fall through */
      }
    }
    const text = (finalText + interimText).trim()
    if (resolver) {
      const r = resolver
      resolver = null
      r(text)
    }
  }

  try {
    recognition.start()
  } catch {
    return null
  }

  return {
    getTranscript: () => (finalText + interimText).trim(),
    abort() {
      wantActive = false
      manualStop = true
      try {
        recognition?.abort()
      } catch {
        /* ignore */
      }
      recognition = null
    },
    stop() {
      manualStop = true
      wantActive = false
      const text = (finalText + interimText).trim()
      if (!recognition) return Promise.resolve(text)
      return new Promise((resolve) => {
        resolver = resolve
        try {
          recognition?.stop()
        } catch {
          resolve(text)
        }
        setTimeout(() => {
          if (resolver) {
            resolver = null
            resolve((finalText + interimText).trim())
          }
        }, 3000)
      })
    },
  }
}
