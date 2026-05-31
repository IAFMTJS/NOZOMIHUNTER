"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { Button } from "@/components/ui/Button"
import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { triggerMomentFreeze } from "@/systems/presentation/momentFreezeSystem"
import { hapticForCeremony } from "@/systems/presentation/hapticsSystem"
import { UI_TOKENS } from "@/config/uiTokens"
import type { HunterRank } from "@/contracts/player-contract"
import { SystemCrest } from "@/components/ui/screen/SystemCrest"
import { RewardIcon } from "@/components/ui/screen/RewardIcon"
import { GameAssetImage } from "@/components/ui/GameAssetImage"
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
  const eliteRank = rank === "SS" || rank === "SSS"
  const [ready, setReady] = useState(false)

  useEffect(() => {
    triggerMomentFreeze(320)
    playAudioCue("confirm")
    hapticForCeremony("levelUp")
    const t = window.setTimeout(() => setReady(true), 900)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <CeremonyOverlay
      open
      intensity="slam"
      ariaLabelledBy="rank-up-title"
      onDismiss={ready ? onDismiss : undefined}
    >
      <div className="nozomi-level-up-burst nozomi-rune-ring pointer-events-none absolute inset-0 rounded-2xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-bright)]">
        {eliteRank ? "Elite rank ceremony" : "Rank increased"}
      </p>
      {eliteRank ? (
        <div className="relative mx-auto h-24 w-full max-w-xs">
          <GameAssetImage assetKey="season.fracture-week.banner" alt="" fill className="rounded-lg" />
        </div>
      ) : (
        <SystemCrest className="!h-24 !w-24" />
      )}
      <div id="rank-up-title">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={MOTION.panel}
          className={UI_TOKENS.displaySlam}
        >
          {prev} → {rank}
        </motion.p>
        <p className="mt-2 font-display text-lg font-bold text-[var(--foreground)]">
          {rankDisplayTitle(prev)} → {rankDisplayTitle(rank)}
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <RewardIcon label={`${rewards.xp} XP`} tone="xp" />
        <RewardIcon label={`+${rewards.skillPoints} SP`} tone="token" />
        <RewardIcon label={`+${rewards.staminaBonus} STA`} tone="item" />
      </div>
      {ready && (
        <Button variant="cta" size="md" className="w-full !py-3" onClick={onDismiss}>
          Claim reward
        </Button>
      )}
    </CeremonyOverlay>
  )
}
