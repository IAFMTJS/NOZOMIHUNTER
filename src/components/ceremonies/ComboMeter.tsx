"use client"

import { xpMultiplierFromStreak } from "@/systems/learning/encounterPressureSystem"

interface ComboMeterProps {
  streak: number
  className?: string
}

export function ComboMeter({ streak, className = "" }: ComboMeterProps) {
  if (streak < 2) return null
  const mult = xpMultiplierFromStreak(streak)
  const hot = streak >= 5
  return (
    <div
      className={`nozomi-combo-meter flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
        hot ? "nozomi-combo-meter--hot" : ""
      } ${className}`}
      role="status"
    >
      <span className="tabular-nums text-[var(--accent-bright)]">×{streak}</span>
      <span className="text-[var(--muted)]">chain</span>
      {mult > 1 && (
        <span className="rounded bg-[var(--reward)]/20 px-1.5 py-0.5 text-[var(--reward)]">
          XP ×{mult.toFixed(2)}
        </span>
      )}
    </div>
  )
}
