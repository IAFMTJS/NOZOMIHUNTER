"use client"

import { useEffect, useState } from "react"
import type { EncounterFeedbackResult } from "@/systems/presentation/encounterFeedbackOrchestrator"
import { pulseHaptic } from "@/systems/presentation/hapticsSystem"

interface EncounterImpactLayerProps {
  feedback: EncounterFeedbackResult | null
  className?: string
}

export function EncounterImpactLayer({
  feedback,
  className = "",
}: EncounterImpactLayerProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!feedback?.cssClasses.length) return
    setActive(true)
    if (feedback.hapticMs) pulseHaptic(feedback.hapticMs)
    const t = window.setTimeout(() => setActive(false), 520)
    return () => window.clearTimeout(t)
  }, [feedback])

  if (!active || !feedback) return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 ${feedback.cssClasses.join(" ")} ${className}`}
    />
  )
}
