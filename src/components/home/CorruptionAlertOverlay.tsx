"use client"

import { useEffect, useState } from "react"
import type { CorruptionBand } from "@/config/corruptionThresholds"
import { corruptionThresholdCopy } from "@/systems/presentation/corruptionPresentationSystem"

const SESSION_KEY = "nozomi-corruption-alert-date"

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

interface CorruptionAlertOverlayProps {
  band: CorruptionBand
}

export function CorruptionAlertOverlay({ band }: CorruptionAlertOverlayProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (band !== "dangerous" && band !== "critical" && band !== "collapse") return
    if (typeof sessionStorage === "undefined") return
    if (sessionStorage.getItem(SESSION_KEY) === todayKey()) return
    setOpen(true)
    sessionStorage.setItem(SESSION_KEY, todayKey())
    const id = window.setTimeout(() => setOpen(false), 3200)
    return () => window.clearTimeout(id)
  }, [band])

  if (!open) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--hunter-nav-height)+4.5rem)] z-[90] mx-auto max-w-md rounded-xl border border-[var(--danger)]/50 bg-[var(--overlay-panel)] p-4 text-center shadow-lg"
      role="alert"
    >
      <p className="text-[10px] uppercase tracking-widest text-[var(--danger)]">
        Corruption alert
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]">{corruptionThresholdCopy(band)}</p>
    </div>
  )
}
