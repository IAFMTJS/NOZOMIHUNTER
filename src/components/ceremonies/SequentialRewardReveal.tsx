"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import type { RewardIconItem } from "@/components/ui/screen/RewardIconGrid"
import {
  REWARD_REVEAL_STAGGER_MS,
  audioCueForRewardItem,
} from "@/systems/presentation/ceremonies/rewardRevealSequence"
import { playAudioCue } from "@/systems/audio/audioSystem"
import { playThemedCue } from "@/systems/audio/themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

const TONE_CLASS: Record<NonNullable<RewardIconItem["tone"]>, string> = {
  xp: "border-[var(--reward)]/35 bg-[var(--reward)]/10 text-[var(--reward)]",
  credits: "border-white/15 bg-white/5 text-[var(--foreground)]",
  item: "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent-bright)]",
  neutral: "border-[var(--border-subtle)] bg-black/30 text-[var(--muted)]",
}

interface SequentialRewardRevealProps {
  items: RewardIconItem[]
  mode?: "instant" | "sequential"
  theme?: DungeonTheme
  onComplete?: () => void
}

export function SequentialRewardReveal({
  items,
  mode = "sequential",
  theme,
  onComplete,
}: SequentialRewardRevealProps) {
  const [visibleCount, setVisibleCount] = useState(mode === "instant" ? items.length : 0)

  useEffect(() => {
    if (mode === "instant") {
      setVisibleCount(items.length)
      onComplete?.()
      return
    }
    setVisibleCount(0)
    if (items.length === 0) {
      onComplete?.()
      return
    }
    let i = 0
    const tick = () => {
      i += 1
      setVisibleCount(i)
      const item = items[i - 1]
      if (item) {
        const cue = audioCueForRewardItem(item, i - 1)
        if (theme && i === 1) playThemedCue(theme, "extract")
        else if (cue === "rewardTick") playAudioCue("rewardTick")
        else playAudioCue(cue)
      }
      if (i < items.length) {
        window.setTimeout(tick, REWARD_REVEAL_STAGGER_MS)
      } else {
        onComplete?.()
      }
    }
    const start = window.setTimeout(tick, 280)
    return () => window.clearTimeout(start)
  }, [items, mode, theme, onComplete])

  const shown = items.slice(0, visibleCount)

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <AnimatePresence mode="popLayout">
        {shown.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={MOTION.feedback}
            className={`flex min-w-[4.5rem] flex-col items-center justify-center rounded-xl border px-2 py-3 text-center ${
              TONE_CLASS[item.tone ?? "neutral"]
            }`}
          >
            <span className="font-display text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
            {item.sublabel && (
              <span className="mt-1 text-[9px] opacity-85">{item.sublabel}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
