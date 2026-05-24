"use client"

import { useEffect, useState } from "react"
import { useJapaneseTts } from "@/hooks/useJapaneseTts"

interface WordAudioButtonProps {
  japanese: string
  reading?: string
  className?: string
}

export function WordAudioButton({
  japanese,
  reading,
  className = "",
}: WordAudioButtonProps) {
  const [mounted, setMounted] = useState(false)
  const tts = useJapaneseTts()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !tts.supported) return null

  return (
    <button
      type="button"
      aria-label="Play Japanese audio"
      className={`shrink-0 rounded-full border border-[var(--accent)]/40 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--accent-bright)] hover:bg-[var(--accent-dim)] ${className}`}
      disabled={tts.playing}
      onClick={() => void tts.play(japanese, reading)}
    >
      {tts.playing ? "…" : "▶"}
    </button>
  )
}
