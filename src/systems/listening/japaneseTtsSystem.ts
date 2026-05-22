/** Browser Speech Synthesis — no prerecorded audio files. */

export interface SpeakJapaneseOptions {
  /** Kana reading preferred for clearer synthesis. */
  reading?: string
  rate?: number
}

let voicesCache: SpeechSynthesisVoice[] | null = null

export function isJapaneseTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !isJapaneseTtsSupported()) return []
  if (voicesCache?.length) return voicesCache
  voicesCache = speechSynthesis.getVoices()
  return voicesCache
}

function pickJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = loadVoices()
  return (
    voices.find((v) => v.lang === "ja-JP" && /google|premium|enhanced/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("ja")) ??
    voices.find((v) => v.lang.includes("JP"))
  )
}

export function stopJapaneseSpeech(): void {
  if (!isJapaneseTtsSupported()) return
  speechSynthesis.cancel()
}

export function speakJapanese(
  japanese: string,
  options: SpeakJapaneseOptions = {}
): Promise<void> {
  if (!isJapaneseTtsSupported()) {
    return Promise.reject(new Error("Text-to-speech is not available in this browser."))
  }

  const text = (options.reading?.trim() || japanese).trim()
  if (!text) return Promise.reject(new Error("Nothing to speak."))

  return new Promise((resolve, reject) => {
    stopJapaneseSpeech()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ja-JP"
    utterance.rate = options.rate ?? 0.88
    utterance.pitch = 1

    const voice = pickJapaneseVoice()
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      reject(new Error(e.error === "canceled" ? "Playback cancelled" : "TTS playback failed"))
    }

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          const v = pickJapaneseVoice()
          if (v) utterance.voice = v
          speechSynthesis.speak(utterance)
        },
        { once: true }
      )
    }

    speechSynthesis.speak(utterance)
  })
}
