"use client"

import { Panel } from "@/components/ui/Panel"

interface DailyContractMilestoneRailProps {
  completed: number
  target: number
  bonusReady: boolean
}

export function DailyContractMilestoneRail({
  completed,
  target,
  bonusReady,
}: DailyContractMilestoneRailProps) {
  const pct = Math.min(100, Math.round((completed / Math.max(1, target)) * 100))

  return (
    <Panel tone="accent" className="!py-3">
      <p className="text-[10px] uppercase tracking-widest text-[var(--accent-bright)]">
        Daily chain
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]">
        {completed}/{target} maintenance contracts cleared today
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {bonusReady
          ? "Bonus cache unlocked on next claim."
          : `Clear ${target - completed} more for supply cache bonus.`}
      </p>
    </Panel>
  )
}
