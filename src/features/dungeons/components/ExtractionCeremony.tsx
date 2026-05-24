"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { playThemedCue } from "@/systems/audio/themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"
import type { ExtractionMasteryEntry } from "@/systems/dungeons/dungeonLexiconRecapSystem"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

interface ExtractionCeremonyProps {
  xp: number
  theme?: DungeonTheme
  streakMultiplier?: number
  masteryRecap?: ExtractionMasteryEntry[]
  disabled?: boolean
  onExtract: () => Promise<void>
}

export function ExtractionCeremony({
  xp,
  theme,
  streakMultiplier = 1,
  masteryRecap = [],
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
      className="nozomi-screen-extraction flex flex-col gap-4"
    >
      <Panel tone="reward">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--reward)]">
          Extraction protocol
        </p>
        {stage === "breach" && (
          <>
            <p className="mt-3 font-display text-xl font-semibold text-[var(--foreground)]">
              Core breached
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Sector unstable. Sync registry before pull-out.
            </p>
            <Button className="mt-6" size="md" onClick={advance}>
              Sync registry
            </Button>
          </>
        )}
        {stage === "sync" && (
          <>
            <p className="mt-3 font-display text-xl font-semibold text-[var(--foreground)]">
              Registry synchronized
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              <span className="text-[var(--reward)]">{xp} XP</span> staged for
              extraction.
              {streakMultiplier > 1 && (
                <span className="block mt-1 text-[var(--accent-bright)]">
                  Channel streak bonus ×{streakMultiplier.toFixed(2)} applied.
                </span>
              )}
            </p>
            {masteryRecap.length > 0 && (
              <ul className="mt-4 space-y-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs">
                <li className="uppercase tracking-[0.18em] text-[var(--muted)]">
                  Lexicon stabilized this run
                </li>
                {masteryRecap.map((entry) => (
                  <li
                    key={entry.wordId}
                    className="flex justify-between gap-2 text-[var(--foreground)]"
                  >
                    <span>{entry.label}</span>
                    <span className="tabular-nums text-[var(--reward)]">
                      {entry.mastery}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-6" size="md" onClick={advance}>
              Arm extraction
            </Button>
          </>
        )}
        {stage === "ready" && (
          <>
            <p className="mt-3 font-display text-xl font-semibold text-[var(--foreground)]">
              Extract rewards
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Pull XP and corridor unlocks into your hunter profile.
            </p>
            <Button
              className="mt-6"
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
