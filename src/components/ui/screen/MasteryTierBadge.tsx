"use client"

import {
  masteryTierFromPercent,
  masteryTierLearnerLabel,
} from "@/systems/presentation/masteryPresentationSystem"

interface MasteryTierBadgeProps {
  masteryPercent: number
  className?: string
}

export function MasteryTierBadge({ masteryPercent, className = "" }: MasteryTierBadgeProps) {
  const tier = masteryTierFromPercent(masteryPercent)
  const label = masteryTierLearnerLabel(tier)
  const toneClass =
    tier === "MASTERED"
      ? "nozomi-mastery--mastered"
      : tier === "STABLE"
        ? "nozomi-mastery--stable"
        : tier === "FAMILIAR" || tier === "SEEN"
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
