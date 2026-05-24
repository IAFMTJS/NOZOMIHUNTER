"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { HunterRank } from "@/contracts/player-contract"
import { MOTION } from "@/config/motionPresets"
import { Button } from "@/components/ui/Button"
import { SystemCrest } from "@/components/ui/screen/SystemCrest"
import { RewardIcon } from "@/components/ui/screen/RewardIcon"
import {
  previousRank,
  rankDisplayTitle,
  rankPromotionRewards,
} from "@/systems/presentation/rankPresentationSystem"

interface RankUpNoticeProps {
  rank: HunterRank
  onDismiss: () => void
}

export function RankUpNotice({ rank, onDismiss }: RankUpNoticeProps) {
  const prev = previousRank(rank)
  const rewards = rankPromotionRewards(rank)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={MOTION.panel}
        className="nozomi-rank-up-overlay fixed inset-0 z-[200] flex items-center justify-center p-4"
        role="dialog"
        aria-modal
        aria-labelledby="rank-up-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={MOTION.panel}
          className="nozomi-glass-card nozomi-glass-card-accent w-full max-w-sm space-y-6 p-6 text-center"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-bright)]">
            Rank increased
          </p>
          <SystemCrest className="!h-24 !w-24" />
          <div id="rank-up-title">
            <p className="font-display text-2xl font-bold text-[var(--foreground)]">
              {prev} → {rank}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {rankDisplayTitle(prev)} → {rankDisplayTitle(rank)}
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <RewardIcon label={`${rewards.xp} XP`} tone="xp" />
            <RewardIcon label={`+${rewards.skillPoints} SP`} tone="token" />
            <RewardIcon label={`+${rewards.staminaBonus} STA`} tone="item" />
          </div>
          <Button variant="cta" size="md" className="w-full !py-3" onClick={onDismiss}>
            Claim reward
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
