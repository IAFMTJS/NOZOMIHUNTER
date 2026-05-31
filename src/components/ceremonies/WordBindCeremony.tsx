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

export interface WordBindCeremonyData {
  wordId: string
  mastery: number
}

interface WordBindCeremonyProps {
  data: WordBindCeremonyData
  onDismiss: () => void
}

export function WordBindCeremony({ data, onDismiss }: WordBindCeremonyProps) {
  useEffect(() => {
    triggerMomentFreeze(200)
    playAudioCue("confirm")
    hapticForCeremony("achievement")
  }, [])

  return (
    <CeremonyOverlay open ariaLabelledBy="word-bind-title" intensity="default">
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--reward)]">
        Lexicon bind
      </p>
      <motion.h2
        id="word-bind-title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION.panel}
        className={`${UI_TOKENS.displaySlam} !text-2xl`}
      >
        Word bound
      </motion.h2>
      <p className="text-sm text-[var(--muted)]">
        Target stabilized at {Math.round(data.mastery)}% mastery — passive bonuses active.
      </p>
      <p className="font-mono text-xs text-[var(--accent-bright)]">{data.wordId}</p>
      <Button variant="cta" size="md" className="mt-4 w-full !py-3" onClick={onDismiss}>
        Continue hunt
      </Button>
    </CeremonyOverlay>
  )
}
