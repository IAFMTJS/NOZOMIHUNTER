"use client"

import { RewardIconGrid, type RewardIconItem } from "@/components/ui/screen/RewardIconGrid"
import { Button } from "@/components/ui/Button"

export interface GateClearedStats {
  timeLabel: string
  accuracyPercent: number
  grade: string
  newWordsUnlocked?: number
  masteryIncreasePercent?: number
}

interface GateClearedScreenProps {
  stats: GateClearedStats
  rewards: RewardIconItem[]
  onContinue: () => void
}

export function GateClearedScreen({
  stats,
  rewards,
  onContinue,
}: GateClearedScreenProps) {
  return (
    <div className="nozomi-screen-extraction space-y-5 py-4 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[var(--accent)]/50 bg-[var(--accent-dim)] shadow-[0_0_40px_var(--glow-accent)]">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-bright)]">
          Gate
          <br />
          Cleared
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-left">
        <StatBlock label="Time" value={stats.timeLabel} />
        <StatBlock label="Accuracy" value={`${stats.accuracyPercent}%`} />
        <StatBlock label="Grade" value={stats.grade} highlight />
      </div>

      <RewardIconGrid items={rewards} />

      {(stats.newWordsUnlocked != null || stats.masteryIncreasePercent != null) && (
        <div className="space-y-1 text-sm text-[var(--muted)]">
          {stats.newWordsUnlocked != null && (
            <p>New words unlocked: {stats.newWordsUnlocked}</p>
          )}
          {stats.masteryIncreasePercent != null && (
            <p>Mastery increase: +{stats.masteryIncreasePercent}%</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="cta" size="md" className="w-full !py-3" onClick={onContinue}>
          Return to mission log
        </Button>
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-black/30 px-2 py-3">
      <p className="text-[9px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p
        className={`mt-1 font-display text-lg font-bold ${
          highlight ? "text-[var(--reward)]" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
