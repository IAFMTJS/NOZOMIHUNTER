"use client"

import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromEncounterWord } from "@/services/jmdict/learnerFormat"

interface EncounterRailWordProps {
  japanese: string
  reading?: string
  romaji?: string
  meanings?: string[]
}

/** Compact triple for encounter target rails (no audio). */
export function EncounterRailWord({
  japanese,
  reading,
  romaji,
  meanings,
}: EncounterRailWordProps) {
  return (
    <LearnerWordLine
      parts={learnerPartsFromEncounterWord({ japanese, reading, romaji, meanings })}
      layout="compact"
      size="sm"
    />
  )
}
