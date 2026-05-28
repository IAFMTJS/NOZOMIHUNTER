"use client"

import { useCallback } from "react"
import { useSpeechRecording } from "@/hooks/useSpeechRecording"
import { getSpeechResponseTimeMs } from "@/systems/speech/speechProcessingSystem"

/** Wires mic + transmit for SpeechEncounter (presentation stays in component). */
export function useSpeechEncounter(options: {
  onSubmit: (transcript: string, responseTimeMs: number) => Promise<void>
}) {
  const recording = useSpeechRecording("ja-JP")

  const transmit = useCallback(
    async (typed?: string) => {
      const transcript = typed ?? recording.transcript
      if (!transcript.trim()) return
      await options.onSubmit(transcript, getSpeechResponseTimeMs())
    },
    [options, recording.transcript]
  )

  return { recording, transmit }
}
