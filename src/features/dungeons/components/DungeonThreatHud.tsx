"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { threatHudLines } from "@/systems/presentation/dungeonThreatPresentation"

interface DungeonThreatHudProps {
  run: DungeonRunContract
  compact?: boolean
}

export function DungeonThreatHud({ run, compact }: DungeonThreatHudProps) {
  const threat = run.threat
  if (!threat) return null

  const lines = threatHudLines(threat)

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "text-[10px]" : "text-xs"}`}
      aria-label="Sector threat meters"
    >
      {lines.map((line) => (
        <span
          key={line}
          className="rounded border border-[var(--border-subtle)]/80 bg-[var(--surface)]/60 px-2 py-0.5 uppercase tracking-wider text-[var(--accent-bright)]"
        >
          {line}
        </span>
      ))}
      {run.lastConsequenceLine && !compact && (
        <p className="w-full text-[var(--muted)]">{run.lastConsequenceLine}</p>
      )}
    </div>
  )
}
