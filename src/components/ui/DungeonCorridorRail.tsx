"use client"

import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

interface SectorNode {
  id: string
  label: string
  completed: boolean
  current: boolean
  explorationProgress?: number
}

interface DungeonCorridorRailProps {
  sectors: SectorNode[]
}

export function DungeonCorridorRail({ sectors }: DungeonCorridorRailProps) {
  return (
    <ol className="mb-4 flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-3">
      {sectors.map((sector) => (
        <motion.li
          key={sector.id}
          layout
          transition={MOTION.panel}
          className={`relative flex items-center gap-2 py-1 text-xs before:absolute before:-left-3 before:top-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:rounded-full before:content-[''] ${
            sector.current
              ? "font-semibold text-[var(--accent-bright)] before:bg-[var(--accent)] before:shadow-[0_0_8px_var(--glow-accent)]"
              : sector.completed
                ? "text-[var(--accent)] before:bg-[var(--accent)]/60"
                : "text-[var(--muted)] before:border before:border-[var(--border-subtle)] before:bg-[var(--surface-2)]"
          }`}
        >
          <span className="uppercase tracking-wide">{sector.label}</span>
          {sector.completed && (
            <span className="text-[10px] text-[var(--success)]">cleared</span>
          )}
          {sector.current && sector.explorationProgress != null && (
            <span className="text-[10px] text-[var(--muted)]">
              {sector.explorationProgress}%
            </span>
          )}
        </motion.li>
      ))}
    </ol>
  )
}
