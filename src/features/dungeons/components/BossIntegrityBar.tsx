"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import {
  bossIntegrityLabel,
  bossIntegrityPercent,
} from "@/systems/presentation/dungeonMasterPresentation"

interface BossIntegrityBarProps {
  run: DungeonRunContract
}

export function BossIntegrityBar({ run }: BossIntegrityBarProps) {
  const pct = bossIntegrityPercent(run)
  return (
    <div className="mb-3" aria-label="Boss integrity">
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[var(--muted)]">
        <span>Boss integrity</span>
        <span>{bossIntegrityLabel(pct)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full bg-[var(--danger)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
