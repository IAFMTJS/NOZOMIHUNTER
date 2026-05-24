"use client"

import { useRef, useState } from "react"
import { useSpeechRecording } from "@/hooks/useSpeechRecording"

interface UseSpeechEncounterControllerOptions {
  disabled?: boolean
  onSubmit: (transcript: string, responseTimeMs: number) => Promise<void>
}

export function useSpeechEncounterController({
  disabled,
  onSubmit,
}: UseSpeechEncounterControllerOptions) {
  const [typed, setTyped] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const phaseStartRef = useRef(Date.now())
  const speech = useSpeechRecording("ja-JP")

  const busy =
    speech.recording || speech.processing || submitting || disabled

  async function transmit(transcript: string, responseTimeMs: number) {
    if (!transcript.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(transcript.trim(), responseTimeMs)
      setTyped("")
      speech.clearTranscript()
      phaseStartRef.current = Date.now()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTypedSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ms = Math.max(0, Date.now() - phaseStartRef.current)
    await transmit(typed, ms)
  }

  function handleMicToggle() {
    if (speech.recording) {
      void (async () => {
        const result = await speech.stopAndGetTranscript()
        const ms =
          result.responseTimeMs ||
          speech.getResponseTimeMs() ||
          Math.max(0, Date.now() - phaseStartRef.current)
        if (result.ok && result.transcript.trim()) {
          await transmit(result.transcript, ms)
        }
      })()
      return
    }
    if (speech.processing) return
    phaseStartRef.current = Date.now()
    const micRequest = speech.captureMicFromGesture()
    void speech.start(micRequest)
  }

  return {
    speech,
    typed,
    setTyped,
    submitting,
    busy,
    handleTypedSubmit,
    handleMicToggle,
    displayTranscript: speech.transcript || typed,
  }
}
