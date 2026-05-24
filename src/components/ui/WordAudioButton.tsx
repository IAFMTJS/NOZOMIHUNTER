"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  isJapaneseTtsSupported,
  speakJapanese,
  stopJapaneseSpeech,
} from "@/systems/listening/japaneseTtsSystem"
import { unlockAudio } from "@/systems/audio/audioSystem"

interface WordAudioButtonProps {
  japanese: string
  reading?: string
  className?: string
}

/** Lightweight play control — shares global speechSynthesis queue (no per-button RAF). */
export function WordAudioButton({
  japanese,
  reading,
  className = "",
}: WordAudioButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (playingRef.current) stopJapaneseSpeech()
    }
  }, [])

  const play = useCallback(async () => {
    unlockAudio()
    playingRef.current = true
    setPlaying(true)
    try {
      await speakJapanese(japanese, { reading })
    } catch {
      /* cancelled or unsupported — no toast for word chips */
    } finally {
      playingRef.current = false
      setPlaying(false)
    }
  }, [japanese, reading])

  if (!mounted || !isJapaneseTtsSupported()) return null

  return (
    <button
      type="button"
      aria-label="Play Japanese audio"
      className={`shrink-0 rounded-full border border-[var(--accent)]/40 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--accent-bright)] hover:bg-[var(--accent-dim)] ${className}`}
      disabled={playing}
      onClick={() => void play()}
    >
      {playing ? "…" : "▶"}
    </button>
  )
}
