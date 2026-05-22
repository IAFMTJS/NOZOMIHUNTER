"use client"

import { useCallback, useEffect, useState } from "react"
import {
  isJapaneseTtsSupported,
  speakJapanese,
  stopJapaneseSpeech,
} from "@/systems/listening/japaneseTtsSystem"
import { unlockAudio } from "@/systems/audio/audioSystem"

export function useJapaneseTts() {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supported = isJapaneseTtsSupported()

  useEffect(() => {
    return () => stopJapaneseSpeech()
  }, [])

  const play = useCallback(async (japanese: string, reading?: string) => {
    unlockAudio()
    setError(null)
    setPlaying(true)
    try {
      await speakJapanese(japanese, { reading })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not play signal")
    } finally {
      setPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    stopJapaneseSpeech()
    setPlaying(false)
  }, [])

  return { supported, playing, error, play, stop }
}
