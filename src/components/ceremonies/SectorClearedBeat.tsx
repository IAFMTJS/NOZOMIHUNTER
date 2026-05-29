"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

interface SectorClearedBeatProps {
  open: boolean
  line: string
  onDone: () => void
}

export function SectorClearedBeat({ open, line, onDone }: SectorClearedBeatProps) {
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(onDone, 800)
    return () => window.clearTimeout(id)
  }, [open, onDone])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.feedback}
          className="nozomi-sector-cleared-beat pointer-events-none fixed inset-x-4 top-24 z-[150] mx-auto max-w-sm rounded-xl border border-[var(--reward)]/40 bg-[var(--overlay-panel)] p-4 text-center shadow-lg"
          role="status"
        >
          <p className="text-[10px] uppercase tracking-widest text-[var(--reward)]">
            Sector cleared
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{line}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
