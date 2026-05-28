"use client"

import { DungeonFailureCeremony } from "@/components/ceremonies/DungeonFailureCeremony"

interface DungeonRunnerFailureOverlayProps {
  open: boolean
  detailLine: string | null
  onContinue: () => void
}

export function DungeonRunnerFailureOverlay({
  open,
  detailLine,
  onContinue,
}: DungeonRunnerFailureOverlayProps) {
  return (
    <DungeonFailureCeremony
      open={open}
      detailLine={detailLine}
      onContinue={onContinue}
    />
  )
}
