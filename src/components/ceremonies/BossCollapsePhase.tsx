"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

interface BossCollapsePhaseProps {
  theme?: DungeonTheme
  onComplete: () => void
}

const THEME_COPY: Record<string, string> = {
  CYBER_TOKYO: "Seal fracture — neon lattice collapsing",
  SHADOW_ARCHIVE: "Ink dispersion — archive seals shatter",
  ABANDONED_STATION: "Signal tower collapse — static purge",
  CORRUPTED_SHRINE: "Corruption shatter — shrine seals break",
  NEON_CITY: "City grid overload — hostiles dissolved",
}

export function BossCollapsePhase({ theme, onComplete }: BossCollapsePhaseProps) {
  const [visible, setVisible] = useState(true)
  const line = theme ? THEME_COPY[theme] ?? "Hostile signal dissolved" : "Hostile signal dissolved"

  useEffect(() => {
    const t = window.setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 1400)
    return () => window.clearTimeout(t)
  }, [onComplete])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION.panel}
      className={`nozomi-boss-collapse nozomi-boss-collapse--${(theme ?? "default").toLowerCase()} py-12 text-center`}
      aria-hidden
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--danger)]">
        Extraction breach
      </p>
      <p className="mt-4 font-display text-lg text-[var(--foreground)]">{line}</p>
    </motion.div>
  )
}
