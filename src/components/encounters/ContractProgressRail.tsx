"use client"

import type { ContractProgressViewModel } from "@/systems/presentation/contractProgressPresentationSystem"

interface ContractProgressRailProps {
  view: ContractProgressViewModel
}

export function ContractProgressRail({ view }: ContractProgressRailProps) {
  return (
    <div className="nozomi-contract-progress mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-subtle)] p-3">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--muted)]">
        <span>Recovered intel</span>
        <span>{view.fragmentLabel}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full bg-[var(--accent)] transition-all"
          style={{ width: `${view.recoveredPercent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--foreground)]">{view.objectiveLine}</p>
    </div>
  )
}
