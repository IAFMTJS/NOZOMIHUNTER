"use client"

import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { CORRUPTION_UI_THRESHOLD } from "@/systems/presentation/penaltyPresentationSystem"

interface CorruptionWidgetProps {
  penalties: PlayerPenaltyContract
}

export function CorruptionWidget({ penalties }: CorruptionWidgetProps) {
  const value = penalties.corruption
  const show = value >= CORRUPTION_UI_THRESHOLD / 2 || value > 0

  if (!show) return null

  return (
    <div className="nozomi-embedded rounded-xl border border-[var(--danger)]/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-xs uppercase tracking-widest text-[var(--danger)]">
          System corruption
        </span>
        <span className="font-mono text-sm tabular-nums text-[var(--danger)]">
          {value}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--overlay-track)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--danger)] to-[var(--warning)] shadow-[0_0_12px_var(--danger)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      {value >= CORRUPTION_UI_THRESHOLD && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Signal degradation detected. Reduce corruption before sector deployment.
        </p>
      )}
    </div>
  )
}
