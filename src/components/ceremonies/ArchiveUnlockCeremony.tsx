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

export interface ArchiveUnlockCeremonyData {
  archiveUnlockId: string
  title: string
  excerpt?: string
}

interface ArchiveUnlockCeremonyProps {
  data: ArchiveUnlockCeremonyData
  onDismiss: () => void
}

export function ArchiveUnlockCeremony({ data, onDismiss }: ArchiveUnlockCeremonyProps) {
  useEffect(() => {
    triggerMomentFreeze(240)
    playAudioCue("rewardCascade")
    hapticForCeremony("achievement")
  }, [])

  return (
    <CeremonyOverlay open intensity="slam" ariaLabelledBy="archive-unlock-title">
      <div className="nozomi-rune-ring pointer-events-none absolute inset-0 rounded-2xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-bright)]">
        Black Archive
      </p>
      <motion.h2
        id="archive-unlock-title"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={MOTION.panel}
        className={`${UI_TOKENS.displaySlam} !text-2xl`}
      >
        Fragment restored
      </motion.h2>
      <p className="font-display text-lg text-[var(--foreground)]">{data.title}</p>
      {data.excerpt && (
        <p className="text-sm italic text-[var(--muted)]">{data.excerpt}</p>
      )}
      <p className="text-xs text-[var(--muted)]">Registry ID · {data.archiveUnlockId}</p>
      <Button variant="cta" size="md" className="w-full !py-3" onClick={onDismiss}>
        Read in archive
      </Button>
    </CeremonyOverlay>
  )
}
