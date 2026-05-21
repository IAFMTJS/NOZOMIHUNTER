"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createMicLevelMonitor,
  ensureMicrophoneAccess,
  releaseMicrophone,
} from "@/services/speech/microphone"

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

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  if (!window.isSecureContext) return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function formatSpeechError(code: string, lang: SpeechRecognitionLang): string {
  switch (code) {
    case "not-allowed":
      return "Speech blocked. Allow microphone in the browser bar, then reload."
    case "no-speech":
      return lang === "ja-JP"
        ? "No Japanese detected. Try Romaji mode, speak louder, or type below."
        : "No speech detected. Speak the romaji line clearly or type below."
    case "audio-capture":
      return "No microphone input. Check Windows sound settings (input device)."
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

export function useBrowserSpeech(initialLang: SpeechRecognitionLang = "en-US") {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<SpeechRecognitionLang>(initialLang)
  const [micLevel, setMicLevel] = useState(0)
  const [micReady, setMicReady] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef("")
  const finalTranscriptRef = useRef("")
  const startedAtRef = useRef(0)
  const endResolverRef = useRef<((text: string) => void) | null>(null)
  const wantListeningRef = useRef(false)
  const manualStopRef = useRef(false)
  const restartCountRef = useRef(0)
  const stopLevelMonitorRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => {
      wantListeningRef.current = false
      manualStopRef.current = true
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      const dispose = stopLevelMonitorRef.current
      stopLevelMonitorRef.current = null
      dispose?.()
      releaseMicrophone()
    }
  }, [])

  const syncTranscript = useCallback((text: string) => {
    const trimmed = text.trim()
    transcriptRef.current = trimmed
    setTranscript(trimmed)
  }, [])

  const applyResults = useCallback(
    (event: SpeechRecognitionResultEvent) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const piece = result[0]?.transcript ?? ""
        if (result.isFinal) {
          finalTranscriptRef.current += piece
        } else {
          interim += piece
        }
      }
      syncTranscript(finalTranscriptRef.current + interim)
    },
    [syncTranscript]
  )

  const stopLevelMonitor = useCallback(() => {
    const dispose = stopLevelMonitorRef.current
    stopLevelMonitorRef.current = null
    dispose?.()
    setMicLevel(0)
  }, [])

  const finishSession = useCallback(() => {
    setListening(false)
    wantListeningRef.current = false
    stopLevelMonitor()

    const resolver = endResolverRef.current
    endResolverRef.current = null
    if (resolver) {
      resolver(transcriptRef.current)
    }
  }, [stopLevelMonitor])

  const attachRecognitionHandlers = useCallback(
    (recognition: SpeechRecognitionInstance) => {
      recognition.onstart = () => {
        setListening(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        applyResults(event)
      }

      recognition.onerror = (evt) => {
        const message = formatSpeechError(evt.error, lang)
        if (message) setError(message)

        if (
          evt.error === "no-speech" &&
          wantListeningRef.current &&
          !manualStopRef.current &&
          restartCountRef.current < 4
        ) {
          restartCountRef.current += 1
          return
        }

        if (evt.error !== "aborted") {
          manualStopRef.current = true
          wantListeningRef.current = false
        }
      }

      recognition.onend = () => {
        if (
          wantListeningRef.current &&
          !manualStopRef.current &&
          recognitionRef.current === recognition
        ) {
          try {
            recognition.start()
            return
          } catch {
            /* fall through */
          }
        }

        recognitionRef.current = null
        finishSession()
      }
    },
    [applyResults, finishSession, lang]
  )

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return false

    finalTranscriptRef.current = ""
    syncTranscript("")

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    attachRecognitionHandlers(recognition)
    recognitionRef.current = recognition

    try {
      recognition.start()
      return true
    } catch {
      recognitionRef.current = null
      return false
    }
  }, [lang, attachRecognitionHandlers, syncTranscript])

  const start = useCallback(async () => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError(
        typeof window !== "undefined" && !window.isSecureContext
          ? "Voice requires HTTPS (or localhost)."
          : "Use Chrome or Edge for voice capture."
      )
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }

    setError(null)
    syncTranscript("")
    finalTranscriptRef.current = ""
    startedAtRef.current = Date.now()
    manualStopRef.current = false
    wantListeningRef.current = true
    restartCountRef.current = 0

    const mic = await ensureMicrophoneAccess()
    setMicReady(mic.ok)
    if (!mic.ok) {
      wantListeningRef.current = false
      setError(mic.error ?? "Microphone not available")
      return
    }

    stopLevelMonitor()
    stopLevelMonitorRef.current = createMicLevelMonitor(setMicLevel)

    const started = startRecognition()
    if (!started) {
      wantListeningRef.current = false
      setError("Could not start speech recognition. Wait a second and try again.")
      stopLevelMonitor()
    } else {
      setListening(true)
    }
  }, [syncTranscript, startRecognition, stopLevelMonitor])

  const stopAndGetTranscript = useCallback((): Promise<string> => {
    manualStopRef.current = true
    wantListeningRef.current = false

    const active = recognitionRef.current
    if (!active) {
      stopLevelMonitor()
      return Promise.resolve(transcriptRef.current)
    }

    return new Promise((resolve) => {
      endResolverRef.current = resolve
      try {
        active.stop()
      } catch {
        finishSession()
        resolve(transcriptRef.current)
      }
      window.setTimeout(() => {
        if (endResolverRef.current === resolve) {
          endResolverRef.current = null
          setListening(false)
          stopLevelMonitor()
          resolve(transcriptRef.current)
        }
      }, 3000)
    })
  }, [finishSession, stopLevelMonitor])

  const stop = useCallback(() => {
    void stopAndGetTranscript()
  }, [stopAndGetTranscript])

  const getResponseTimeMs = useCallback(() => {
    if (!startedAtRef.current) return 0
    return Math.max(0, Date.now() - startedAtRef.current)
  }, [])

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = ""
    syncTranscript("")
  }, [syncTranscript])

  const changeLang = useCallback((next: SpeechRecognitionLang) => {
    setLang(next)
    setError(null)
  }, [])

  return {
    supported,
    listening,
    transcript,
    interim: transcript,
    error,
    lang,
    setLang: changeLang,
    micLevel,
    micReady,
    start,
    stop,
    stopAndGetTranscript,
    getResponseTimeMs,
    clearTranscript,
    clearInterim: clearTranscript,
  }
}
