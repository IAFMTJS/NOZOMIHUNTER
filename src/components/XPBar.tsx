"use client"

import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

interface XPBarProps {
  currentXP: number
  requiredXP: number
  level: number
  xpDebt?: number
}

export function XPBar({
  currentXP,
  requiredXP,
  level,
  xpDebt = 0,
}: XPBarProps) {
  const percentage =
    requiredXP > 0 ? Math.min(100, (currentXP / requiredXP) * 100) : 0
  const debtPct =
    requiredXP > 0 && xpDebt > 0
      ? Math.min(percentage, (xpDebt / requiredXP) * 100)
      : 0

  return (
    <div className="w-full" role="group" aria-label={`Level ${level} experience`}>
      <div className="mb-1.5 flex justify-between font-display text-xs uppercase tracking-wider text-[var(--muted)]">
        <span>Level {level}</span>
        <span className="tabular-nums">
          {currentXP} / {requiredXP} XP
          {xpDebt > 0 && (
            <span className="ml-2 text-[var(--danger)]">· debt {xpDebt}</span>
          )}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--overlay-track)]">
        {debtPct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--danger)]/50"
            style={{ width: `${debtPct}%` }}
            aria-hidden
          />
        )}
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-[var(--accent)]/70 to-[var(--accent-bright)]"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: MOTION.panel.ease }}
        />
      </div>
    </div>
  )
}
