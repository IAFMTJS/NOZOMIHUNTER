"use client"

import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

interface SectorNode {
  id: string
  label: string
  glyph?: string
  completed: boolean
  current: boolean
  explorationProgress?: number
}

interface DungeonCorridorRailProps {
  sectors: SectorNode[]
}

export function DungeonCorridorRail({ sectors }: DungeonCorridorRailProps) {
  return (
    <ol className="nozomi-corridor-rail flex flex-col gap-0.5 border-l-2 border-[var(--accent)]/20 pl-4">
      {sectors.map((sector, i) => (
        <motion.li
          key={sector.id}
          layout
          transition={MOTION.panel}
          className={`nozomi-corridor-node relative flex items-center gap-3 py-2 text-xs before:absolute before:-left-[17px] before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:content-[''] ${
            sector.current
              ? "text-[var(--accent-bright)] before:bg-[var(--accent)] before:shadow-[0_0_10px_var(--glow-accent)]"
              : sector.completed
                ? "text-[var(--accent)]/80 before:bg-[var(--accent)]/50"
                : "text-[var(--muted)] before:border before:border-[var(--border-subtle)] before:bg-[var(--surface-2)]"
          }`}
        >
          {sector.glyph && (
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border text-[11px] font-display ${
                sector.current
                  ? "border-[var(--accent)]/50 bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "border-[var(--border-subtle)] bg-black/30 text-[var(--muted)]"
              }`}
              aria-hidden
            >
              {sector.glyph}
            </span>
          )}
          <span className="min-w-0 flex-1 leading-snug">
            <span className="mr-1.5 font-mono text-[10px] text-[var(--muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            {sector.label}
          </span>
          {sector.completed && (
            <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--success)]">
              OK
            </span>
          )}
          {sector.current && sector.explorationProgress != null && (
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--reward)]">
              {sector.explorationProgress}%
            </span>
          )}
        </motion.li>
      ))}
    </ol>
  )
}
