"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { Button } from "@/components/ui/Button"
import { SequentialRewardReveal } from "@/components/ceremonies/SequentialRewardReveal"
import { playAudioCue } from "@/systems/audio/audioSystem"
import type { DungeonClearCeremonyViewModel } from "@/systems/presentation/ceremonies/ceremonyTypes"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

interface DungeonClearCeremonyProps {
  data: DungeonClearCeremonyViewModel
  theme?: DungeonTheme
  disabled?: boolean
  onExtract: () => Promise<void>
}

export function DungeonClearCeremony({
  data,
  theme,
  disabled,
  onExtract,
}: DungeonClearCeremonyProps) {
  const [rewardsDone, setRewardsDone] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MOTION.panel}
      className="nozomi-dungeon-clear space-y-5 py-2 text-center"
    >
      <div className="nozomi-dungeon-clear-slam mx-auto max-w-md">
        <p className="text-[10px] uppercase tracking-[0.36em] text-[var(--danger)]">
          Dungeon cleared
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-[var(--foreground)]">
          {data.dungeonName}
        </p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[var(--reward)]">
          {data.performanceLabel}
        </p>
      </div>

      <SequentialRewardReveal
        items={data.rewards}
        mode="sequential"
        theme={theme}
        onComplete={() => {
          setRewardsDone(true)
          playAudioCue("sectorClear")
        }}
      />

      {data.streakMultiplier != null && data.streakMultiplier > 1 && (
        <p className="text-xs text-[var(--accent-bright)]">
          Channel streak ×{data.streakMultiplier.toFixed(2)}
        </p>
      )}

      {data.masteryRecap && data.masteryRecap.length > 0 && (
        <ul className="mx-auto max-w-xs space-y-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left text-xs">
          <li className="uppercase tracking-[0.18em] text-[var(--muted)]">
            Lexicon stabilized
          </li>
          {data.masteryRecap.map((e) => (
            <li key={e.label} className="flex justify-between gap-2">
              <span>{e.label}</span>
              <span className="text-[var(--reward)]">{e.mastery}%</span>
            </li>
          ))}
        </ul>
      )}

      {rewardsDone && (
        <ul className="space-y-1 text-xs text-[var(--muted)]">
          {data.aftermathLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      <Button
        variant="cta"
        size="md"
        className="w-full !py-3"
        disabled={disabled || busy || !rewardsDone}
        onClick={async () => {
          setBusy(true)
          try {
            playAudioCue("questComplete")
            await onExtract()
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? "Extracting…" : "Extract to registry"}
      </Button>
    </motion.div>
  )
}
