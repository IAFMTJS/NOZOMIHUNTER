"use client"

import { SequentialRewardReveal } from "@/components/ceremonies/SequentialRewardReveal"
import { RewardIconGrid, type RewardIconItem } from "@/components/ui/screen/RewardIconGrid"
import { Button } from "@/components/ui/Button"
import type {
  GateClearedStats,
  RewardRevealMode,
} from "@/systems/presentation/ceremonies/ceremonyTypes"

export type { GateClearedStats }

interface GateClearedScreenProps {
  stats: GateClearedStats
  rewards: RewardIconItem[]
  onContinue: () => void
  revealMode?: RewardRevealMode
  headline?: string
  subheadline?: string
  performanceLabel?: string
  intensityClass?: string
}

export function GateClearedScreen({
  stats,
  rewards,
  onContinue,
  revealMode = "sequential",
  headline = "Gate Cleared",
  subheadline,
  performanceLabel,
  intensityClass = "",
}: GateClearedScreenProps) {
  const slam = headline === "Dungeon Cleared"

  return (
    <div className={`nozomi-screen-extraction space-y-5 py-4 text-center ${intensityClass}`}>
      <div
        className={
          slam
            ? "nozomi-dungeon-clear-slam mx-auto max-w-md py-4"
            : "mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[var(--accent)]/50 bg-[var(--accent-dim)] shadow-[0_0_40px_var(--glow-accent)]"
        }
      >
        {slam ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.36em] text-[var(--danger)]">
              {headline}
            </p>
            {subheadline && (
              <p className="mt-2 font-display text-xl font-bold text-[var(--foreground)]">
                {subheadline}
              </p>
            )}
            {performanceLabel && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[var(--reward)]">
                {performanceLabel}
              </p>
            )}
          </>
        ) : (
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-bright)]">
            Gate
            <br />
            Cleared
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-left">
        <StatBlock label="Time" value={stats.timeLabel} />
        <StatBlock label="Accuracy" value={`${stats.accuracyPercent}%`} />
        <StatBlock label="Grade" value={stats.grade} highlight />
      </div>

      {revealMode === "sequential" ? (
        <SequentialRewardReveal items={rewards} mode="sequential" />
      ) : (
        <RewardIconGrid items={rewards} />
      )}

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
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] px-2 py-3">
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
