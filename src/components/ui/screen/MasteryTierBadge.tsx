"use client"

import { numericMasteryToTier } from "@/systems/vocabulary/vocabularyMasteryBridge"
import { masteryTierLearnerLabel } from "@/systems/presentation/masteryPresentationSystem"

interface MasteryTierBadgeProps {
  masteryPercent: number
  className?: string
}

export function MasteryTierBadge({ masteryPercent, className = "" }: MasteryTierBadgeProps) {
  const tier = numericMasteryToTier(masteryPercent)
  const label = masteryTierLearnerLabel(tier)
  const toneClass =
    tier === "MASTERED"
      ? "nozomi-mastery--mastered"
      : tier === "CONFIDENT" || tier === "UNDERSTOOD"
        ? "nozomi-mastery--stable"
        : tier === "RECOGNIZED" || tier === "SEEN"
          ? "nozomi-mastery--familiar"
          : "nozomi-mastery--unknown"

  return (
    <span
      className={`nozomi-mastery-badge inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${toneClass} ${className}`}
    >
      {label}
    </span>
  )
}
