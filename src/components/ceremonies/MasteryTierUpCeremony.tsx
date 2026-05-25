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
import type { CanonicalMasteryTier } from "@/systems/presentation/masteryPresentationSystem"

export interface MasteryTierUpCeremonyData {
  wordId: string
  tier: CanonicalMasteryTier
  mastery: number
}

interface MasteryTierUpCeremonyProps {
  data: MasteryTierUpCeremonyData
  onDismiss: () => void
}

const TIER_LABEL: Record<CanonicalMasteryTier, string> = {
  UNKNOWN: "Unknown",
  SEEN: "Seen",
  FAMILIAR: "Familiar",
  STABLE: "Stable",
  MASTERED: "Mastered",
}

export function MasteryTierUpCeremony({ data, onDismiss }: MasteryTierUpCeremonyProps) {
  useEffect(() => {
    triggerMomentFreeze(180)
    playAudioCue("confirm")
    hapticForCeremony("achievement")
  }, [])

  return (
    <CeremonyOverlay open ariaLabelledBy="mastery-tier-title" intensity="default">
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-bright)]">
        Lexicon evolution
      </p>
      <motion.h2
        id="mastery-tier-title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION.panel}
        className={`${UI_TOKENS.displaySlam} !text-2xl`}
      >
        {TIER_LABEL[data.tier]}
      </motion.h2>
      <p className="text-sm text-[var(--muted)]">
        Word stabilized — {Math.round(data.mastery)}% mastery
      </p>
      <Button variant="cta" size="md" className="mt-4 w-full !py-3" onClick={onDismiss}>
        Continue
      </Button>
    </CeremonyOverlay>
  )
}
