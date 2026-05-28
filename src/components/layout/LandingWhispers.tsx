"use client"

import { useEffect, useState } from "react"
import {
  landingTimeOfDayLabel,
  pickLandingWhisper,
} from "@/systems/presentation/landingAmbienceSystem"

export function LandingWhispers() {
  const [whisper, setWhisper] = useState("")
  const [phase, setPhase] = useState("")

  useEffect(() => {
    setWhisper(pickLandingWhisper())
    setPhase(landingTimeOfDayLabel())
    const id = window.setInterval(() => {
      setWhisper(pickLandingWhisper(Date.now()))
    }, 12_000)
    return () => window.clearInterval(id)
  }, [])

  if (!whisper) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[5] text-center"
      aria-live="polite"
    >
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--muted)] opacity-70">
        {phase}
      </p>
      <p className="mt-2 font-display text-sm text-[var(--accent)] opacity-60">
        {whisper}
      </p>
    </div>
  )
}
