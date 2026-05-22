"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

export type EncounterTargetState = "hidden" | "current" | "done"

export interface EncounterTargetItem {
  id: string
  state: EncounterTargetState
  content: ReactNode
}

const STATE_CLASS: Record<EncounterTargetState, string> = {
  done: "bg-[var(--accent)]/20 text-[var(--accent)]",
  current:
    "border border-[var(--border-accent)] text-[var(--accent)] shadow-[0_0_12px_var(--glow-accent)]",
  hidden: "border border-[var(--border-subtle)] text-[var(--muted)]",
}

interface EncounterTargetRailProps {
  items: EncounterTargetItem[]
}

export function EncounterTargetRail({ items }: EncounterTargetRailProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <motion.span
          key={item.id}
          layout
          initial={false}
          animate={
            item.state === "current"
              ? { scale: 1.04 }
              : item.state === "done"
                ? { scale: 1 }
                : { scale: 1 }
          }
          transition={MOTION.feedback}
          className={`inline-flex min-h-9 min-w-[2rem] flex-col items-center justify-center rounded-[var(--radius-chip)] px-2 py-1.5 text-xs ${STATE_CLASS[item.state]} ${
            item.state === "done" ? "nozomi-flash-success" : ""
          }`}
        >
          {item.state === "hidden" ? <span>？</span> : item.content}
        </motion.span>
      ))}
    </div>
  )
}
