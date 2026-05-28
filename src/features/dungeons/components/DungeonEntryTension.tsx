"use client"

import type { DungeonEntryTensionCopy } from "@/systems/presentation/dungeonEntryPresentation"

interface DungeonEntryTensionProps {
  copy: DungeonEntryTensionCopy
}

export function DungeonEntryTension({ copy }: DungeonEntryTensionProps) {
  return (
    <section
      className="nozomi-dungeon-entry-tension rounded-xl border border-[var(--border-subtle)] bg-[var(--overlay-panel)]/60 px-4 py-3"
      aria-label="Sector threat assessment"
    >
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--danger)]">
        {copy.corruptionLabel}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--danger)] transition-all"
          style={{ width: `${copy.corruptionPercent}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs text-[var(--muted)]">{copy.signalLine}</p>
    </section>
  )
}
