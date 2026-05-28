"use client"

import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

const PHASES = [
  { key: "PREPARATION", label: "Prep" },
  { key: "EXPLORATION", label: "Transit" },
  { key: "SECTOR", label: "Sector" },
  { key: "BOSS", label: "Boss" },
  { key: "EXTRACTION", label: "Extract" },
] as const

function phaseIndex(machineState: string): number {
  switch (machineState) {
    case "PREPARATION":
      return 0
    case "EXPLORATION":
      return 1
    case "ENCOUNTER":
    case "REWARD":
      return 2
    case "BOSS":
      return 3
    case "EXTRACTION":
    case "COMPLETE":
      return 4
    default:
      return 0
  }
}

interface DungeonPhaseStepperProps {
  machineState: string
}

export function DungeonPhaseStepper({ machineState }: DungeonPhaseStepperProps) {
  const active = phaseIndex(machineState)

  return (
    <nav
      className="mb-4 flex items-center gap-1"
      aria-label="Dungeon phase"
    >
      {PHASES.map((phase, i) => {
        const done = i < active
        const current = i === active
        return (
          <div key={phase.key} className="flex flex-1 items-center gap-1">
            <motion.span
              layout
              transition={MOTION.panel}
              className={`flex flex-1 flex-col items-center rounded px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider ${
                current
                  ? "bg-[var(--accent)]/25 text-[var(--accent-bright)] ring-1 ring-[var(--border-accent)]"
                  : done
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "bg-[var(--overlay-subtle)] text-[var(--muted)]"
              }`}
            >
              {phase.label}
            </motion.span>
            {i < PHASES.length - 1 && (
              <span
                className={`h-px w-2 shrink-0 ${
                  done ? "bg-[var(--accent)]/50" : "bg-[var(--border-subtle)]"
                }`}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
