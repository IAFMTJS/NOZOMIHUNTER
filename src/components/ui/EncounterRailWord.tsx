"use client"

import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromEncounterWord } from "@/services/jmdict/learnerFormat"

interface EncounterRailWordProps {
  japanese: string
  reading?: string
  romaji?: string
  meanings?: string[]
  /** done = full reveal; current = masked; pending = locked index */
  slotState?: "done" | "current" | "pending"
  index?: number
}

export function EncounterRailWord({
  japanese,
  reading,
  romaji,
  meanings,
  slotState = "current",
  index,
}: EncounterRailWordProps) {
  if (slotState === "pending") {
    return (
      <span className="font-mono text-xs text-[var(--muted)]">
        ·{index != null ? index + 1 : "?"}
      </span>
    )
  }

  if (slotState === "current") {
    return (
      <span className="nozomi-mask-glitch font-mono text-xs uppercase tracking-wider text-[var(--accent-bright)]">
        LOCK {index != null ? index + 1 : ""}
      </span>
    )
  }

  return (
    <LearnerWordLine
      parts={learnerPartsFromEncounterWord({ japanese, reading, romaji, meanings })}
      layout="compact"
      size="sm"
      forceReveal
    />
  )
}
