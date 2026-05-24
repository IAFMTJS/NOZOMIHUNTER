"use client"

import { motion } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import { Button } from "@/components/ui/Button"
import { RewardRow } from "@/components/ui/screen/RewardRow"
import { MOTION } from "@/config/motionPresets"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { useEffect } from "react"

interface SectorRewardInterstitialProps {
  quest: QuestContract
  disabled?: boolean
  onContinue: () => Promise<void>
}

export function SectorRewardInterstitial({
  quest,
  disabled,
  onContinue,
}: SectorRewardInterstitialProps) {
  const run = quest.dungeonRun
  const cleared = run?.dungeon.encounters.filter((e) => e.completed).length ?? 0
  const total = run?.dungeon.encounters.length ?? 0
  const xpPreview = Math.round((quest.rewards.xp ?? 0) / Math.max(1, total))
  const loop = run?.endlessSectorCount ?? 0

  useEffect(() => {
    playAudioCue("sectorClear")
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={MOTION.panel}
      className="nozomi-sector-reward relative overflow-hidden rounded-xl border border-[var(--reward)]/30 p-5"
    >
      <div className="nozomi-sector-reward-glow pointer-events-none absolute inset-0" aria-hidden />
      <p className="relative font-display text-xs uppercase tracking-[0.32em] text-[var(--reward)]">
        Sector cleared
      </p>
      <p className="relative mt-2 text-2xl font-semibold text-[var(--foreground)]">
        Breach {cleared}/{total} secured
      </p>
      <p className="relative mt-2 text-sm text-[var(--muted)]">
        Corridor pressure easing. Push deeper before warden response escalates.
        {loop > 0 && (
          <span className="mt-1 block text-[var(--danger)]/90">
            Corruption loop {loop} — mutations may intensify.
          </span>
        )}
      </p>
      <div className="relative mt-4">
        <RewardRow
          items={[
            {
              key: "sector-xp",
              label: `~${xpPreview} XP sector share`,
              tone: "xp",
            },
            ...(quest.rewards.credits
              ? [
                  {
                    key: "credits",
                    label: `${Math.round((quest.rewards.credits ?? 0) / Math.max(1, total))} credits`,
                    tone: "credits" as const,
                  },
                ]
              : []),
          ]}
        />
      </div>
      <Button
        variant="primary"
        disabled={disabled}
        className="relative mt-5 w-full shadow-[0_0_20px_var(--glow-reward)]"
        onClick={() => void onContinue()}
      >
        Continue corridor transit
      </Button>
    </motion.div>
  )
}
