"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  isJapaneseTtsSupported,
  speakJapanese,
  stopJapaneseSpeech,
} from "@/systems/listening/japaneseTtsSystem"
import { unlockAudio } from "@/systems/audio/audioSystem"

const WAVEFORM_BARS = 12
const IDLE_LEVEL = 0.12

function idleWaveform(): number[] {
  return Array.from({ length: WAVEFORM_BARS }, () => IDLE_LEVEL)
}

export function useJapaneseTts() {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waveformLevels, setWaveformLevels] = useState<number[]>(idleWaveform)
  const supported = isJapaneseTtsSupported()
  const frameRef = useRef(0)

  useEffect(() => {
    return () => stopJapaneseSpeech()
  }, [])

  useEffect(() => {
    if (!playing) {
      setWaveformLevels(idleWaveform())
      return
    }

    let raf = 0
    const tick = () => {
      frameRef.current += 1
      const frame = frameRef.current
      setWaveformLevels(
        Array.from({ length: WAVEFORM_BARS }, (_, i) => {
          const t = frame * 0.09 + i * 0.62
          const base = 0.18 + Math.abs(Math.sin(t)) * 0.55
          const jitter = ((Math.sin(t * 2.7 + i) + 1) / 2) * 0.22
          return Math.min(1, base + jitter)
        })
      )
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const play = useCallback(async (japanese: string, reading?: string) => {
    unlockAudio()
    setError(null)
    setPlaying(true)
    frameRef.current = 0
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

  return { supported, playing, error, waveformLevels, play, stop }
}
