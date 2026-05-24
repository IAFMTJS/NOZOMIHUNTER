"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { Button } from "@/components/ui/Button"
import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { playAudioCue } from "@/systems/audio/audioSystem"
import type { LevelUpCeremonyViewModel } from "@/systems/presentation/ceremonies/ceremonyTypes"

interface LevelUpCeremonyProps {
  data: LevelUpCeremonyViewModel
  onDismiss: () => void
}

export function LevelUpCeremony({ data, onDismiss }: LevelUpCeremonyProps) {
  const [showStats, setShowStats] = useState(false)
  const [showUnlocks, setShowUnlocks] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    playAudioCue("levelUp")
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40)
    }
    const t1 = window.setTimeout(() => setShowStats(true), 500)
    const t2 = window.setTimeout(() => setShowUnlocks(true), 1200)
    const t3 = window.setTimeout(() => setReady(true), 1700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [])

  return (
    <CeremonyOverlay open ariaLabelledBy="level-up-ceremony-title">
      <div className="nozomi-level-up-burst pointer-events-none absolute inset-0 rounded-2xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--reward)]">Level up</p>
      <div id="level-up-ceremony-title">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={MOTION.panel}
          className="font-display text-3xl font-bold text-[var(--foreground)]"
        >
          LVL {data.previousLevel} → {data.level}
        </motion.p>
        <p className="mt-2 text-sm text-[var(--accent-bright)]">
          Lv {data.level} · &ldquo;{data.title}&rdquo;
        </p>
      </div>
      {showStats && (
        <ul className="space-y-2 text-left">
          {data.statGains.map((row, i) => (
            <motion.li
              key={row.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...MOTION.feedback, delay: i * 0.08 }}
              className="flex justify-between gap-4 text-sm"
            >
              <span className="text-[var(--muted)]">{row.label}</span>
              <span className="font-semibold text-[var(--reward)]">+{row.delta}</span>
            </motion.li>
          ))}
        </ul>
      )}
      {showUnlocks && data.unlockLabels.length > 0 && (
        <div className="rounded-lg border border-[var(--accent)]/30 bg-black/30 px-3 py-2 text-left">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-bright)]">
            New unlocked
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--foreground)]">
            {data.unlockLabels.map((label) => (
              <li key={label}>• {label}</li>
            ))}
          </ul>
        </div>
      )}
      {ready && (
        <Button variant="cta" size="md" className="w-full !py-3" onClick={onDismiss}>
          Continue hunt
        </Button>
      )}
    </CeremonyOverlay>
  )
}
