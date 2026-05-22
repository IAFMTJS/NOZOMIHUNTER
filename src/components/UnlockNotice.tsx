"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { getUnlockEntry } from "@/config/unlockRegistry"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

interface UnlockNoticeProps {
  unlockKey: string
  onDismiss: () => void
}

export function UnlockNotice({ unlockKey, onDismiss }: UnlockNoticeProps) {
  const entry = getUnlockEntry(unlockKey)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={MOTION.panel}
        className="mb-6"
      >
        <Panel tone="accent" role="status">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-bright)]">
            Registry unlock
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">
            {entry.label}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{entry.description}</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={onDismiss}>
            Acknowledge
          </Button>
        </Panel>
      </motion.div>
    </AnimatePresence>
  )
}
