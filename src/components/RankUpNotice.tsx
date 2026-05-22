"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { HunterRank } from "@/contracts/player-contract"
import { PROGRESSION_CONFIG } from "@/config/progressionConfig"
import { MOTION } from "@/config/motionPresets"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

interface RankUpNoticeProps {
  rank: HunterRank
  onDismiss: () => void
}

export function RankUpNotice({ rank, onDismiss }: RankUpNoticeProps) {
  const threshold =
    PROGRESSION_CONFIG.RANK_THRESHOLDS[
      rank as keyof typeof PROGRESSION_CONFIG.RANK_THRESHOLDS
    ]

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
            Rank promotion
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--foreground)]">
            Rank {rank}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hunter classification elevated at level {threshold}. The network
            acknowledges your standing.
          </p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={onDismiss}>
            Acknowledge
          </Button>
        </Panel>
      </motion.div>
    </AnimatePresence>
  )
}
