/** Browser Speech Synthesis — no prerecorded audio files. */

export interface SpeakJapaneseOptions {
  /** Kana reading preferred for clearer synthesis. */
  reading?: string
  rate?: number
}

let voicesCache: SpeechSynthesisVoice[] | null = null
let voicesReadyPromise: Promise<void> | null = null
/** Bumps on stop/cancel so in-flight speak promises reject cleanly. */
let playGeneration = 0
let keepAliveTimer: ReturnType<typeof setInterval> | null = null

const KEEP_ALIVE_MS = 5_000
const CANCEL_SETTLE_MS = 40

export function isJapaneseTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function refreshVoicesCache(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !isJapaneseTtsSupported()) return []
  voicesCache = speechSynthesis.getVoices()
  return voicesCache
}

function loadVoices(): SpeechSynthesisVoice[] {
  const voices = refreshVoicesCache()
  if (voices.length) return voices
  return voices
}

function ensureVoicesLoaded(): Promise<void> {
  if (!isJapaneseTtsSupported()) return Promise.resolve()
  if (refreshVoicesCache().length) return Promise.resolve()
  if (voicesReadyPromise) return voicesReadyPromise

  voicesReadyPromise = new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      speechSynthesis.removeEventListener("voiceschanged", finish)
      refreshVoicesCache()
      voicesReadyPromise = null
      resolve()
    }
    speechSynthesis.addEventListener("voiceschanged", finish)
    speechSynthesis.getVoices()
    window.setTimeout(finish, 300)
  })

  return voicesReadyPromise
}

function pickJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = loadVoices()
  return (
    voices.find((v) => v.lang === "ja-JP" && /google|premium|enhanced/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("ja")) ??
    voices.find((v) => v.lang.includes("JP"))
  )
}

function clearKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }
}

/** Chrome / Edge: flush stuck queue and `speaking` flag before the next utterance. */
function resetSpeechEngine(): void {
  if (!isJapaneseTtsSupported()) return
  clearKeepAlive()
  speechSynthesis.cancel()
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.pause()
    speechSynthesis.resume()
    speechSynthesis.cancel()
  }
}

function startKeepAlive(): void {
  clearKeepAlive()
  keepAliveTimer = setInterval(() => {
    if (!speechSynthesis.speaking) {
      clearKeepAlive()
      return
    }
    speechSynthesis.pause()
    speechSynthesis.resume()
  }, KEEP_ALIVE_MS)
}

export function stopJapaneseSpeech(): void {
  if (!isJapaneseTtsSupported()) return
  playGeneration += 1
  resetSpeechEngine()
}

function waitForCancelSettle(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, CANCEL_SETTLE_MS)
  })
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

  const generation = playGeneration + 1
  playGeneration = generation

  return (async () => {
    resetSpeechEngine()
    await waitForCancelSettle()

    if (generation !== playGeneration) {
      throw new Error("Playback cancelled")
    }

    await ensureVoicesLoaded()

    if (generation !== playGeneration) {
      throw new Error("Playback cancelled")
    }

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = options.rate ?? 0.88
      utterance.pitch = 1

      const voice = pickJapaneseVoice()
      if (voice) utterance.voice = voice

      const finish = (err?: Error) => {
        clearKeepAlive()
        if (generation !== playGeneration) return
        if (err) reject(err)
        else resolve()
      }

      utterance.onstart = () => {
        if (generation !== playGeneration) {
          speechSynthesis.cancel()
          return
        }
        startKeepAlive()
      }

      utterance.onend = () => finish()

      utterance.onerror = (e) => {
        const cancelled = e.error === "canceled" || e.error === "interrupted"
        finish(
          new Error(cancelled ? "Playback cancelled" : "TTS playback failed")
        )
      }

      // Deferred speak helps Chromium deliver onend reliably after cancel().
      window.setTimeout(() => {
        if (generation !== playGeneration) return
        speechSynthesis.speak(utterance)
      }, 0)
    })
  })()
}
