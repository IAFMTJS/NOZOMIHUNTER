"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { Button } from "@/components/ui/Button"
import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { hapticForCeremony } from "@/systems/presentation/hapticsSystem"
import { triggerMomentFreeze } from "@/systems/presentation/momentFreezeSystem"
import { UI_TOKENS } from "@/config/uiTokens"
import type { AchievementContract } from "@/systems/progression/achievementSystem"

interface AchievementUnlockCeremonyProps {
  achievement: AchievementContract
  onDismiss: () => void
}

export function AchievementUnlockCeremony({
  achievement,
  onDismiss,
}: AchievementUnlockCeremonyProps) {
  useEffect(() => {
    triggerMomentFreeze(280)
    playAudioCue("achievement")
    hapticForCeremony("achievement")
  }, [])

  return (
    <CeremonyOverlay open ariaLabelledBy="achievement-unlock-title" intensity="slam">
      <div className="nozomi-rune-ring pointer-events-none absolute inset-0 rounded-2xl" />
      <div className="nozomi-level-up-burst pointer-events-none absolute inset-0 rounded-2xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--reward)]">
        Achievement unlocked
      </p>
      <motion.h2
        id="achievement-unlock-title"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={MOTION.panel}
        className={UI_TOKENS.displaySlam}
      >
        {achievement.title}
      </motion.h2>
      <p className="text-sm text-[var(--muted)]">{achievement.description}</p>
      <Button variant="cta" size="md" className="w-full !py-3" onClick={onDismiss}>
        Continue
      </Button>
    </CeremonyOverlay>
  )
}
