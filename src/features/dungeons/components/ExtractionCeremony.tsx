"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { playThemedCue } from "@/systems/audio/themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

interface ExtractionCeremonyProps {
  xp: number
  theme?: DungeonTheme
  disabled?: boolean
  onExtract: () => Promise<void>
}

export function ExtractionCeremony({
  xp,
  theme,
  disabled,
  onExtract,
}: ExtractionCeremonyProps) {
  const [stage, setStage] = useState<"breach" | "sync" | "ready">("breach")
  const [busy, setBusy] = useState(false)

  function advance() {
    if (stage === "breach") {
      setStage("sync")
      if (theme) playThemedCue(theme, "sector")
      else playAudioCue("sectorClear")
      return
    }
    if (stage === "sync") {
      setStage("ready")
      return
    }
  }

  async function extract() {
    setBusy(true)
    try {
      if (theme) playThemedCue(theme, "extract")
      else playAudioCue("questComplete")
      await onExtract()
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MOTION.panel}
      className="flex flex-col gap-3"
    >
      <Panel tone="accent">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-bright)]">
          Extraction protocol
        </p>
        {stage === "breach" && (
          <>
            <p className="mt-2 font-display text-lg font-semibold text-[var(--foreground)]">
              Core breached
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              The sector is unstable. Initiate registry sync before extraction.
            </p>
            <Button className="mt-4" size="md" onClick={advance}>
              Sync registry
            </Button>
          </>
        )}
        {stage === "sync" && (
          <>
            <p className="mt-2 font-display text-lg font-semibold text-[var(--foreground)]">
              Registry synchronized
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Hunter credentials updated. {xp} XP ready for extraction.
            </p>
            <Button className="mt-4" size="md" onClick={advance}>
              Arm extraction
            </Button>
          </>
        )}
        {stage === "ready" && (
          <>
            <p className="mt-2 font-display text-lg font-semibold text-[var(--foreground)]">
              Extract rewards
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pull XP and corridor unlocks into your hunter profile.
            </p>
            <Button
              className="mt-4"
              size="md"
              disabled={disabled || busy}
              onClick={() => void extract()}
            >
              {busy ? "Extracting…" : "Extract rewards"}
            </Button>
          </>
        )}
      </Panel>
    </motion.div>
  )
}
