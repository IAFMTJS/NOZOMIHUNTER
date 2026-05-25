"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { corruptionDistortionClass } from "@/systems/presentation/dungeonDomainPresentation"

interface CorruptionDistortionLayerProps {
  run: DungeonRunContract
}

export function CorruptionDistortionLayer({ run }: CorruptionDistortionLayerProps) {
  const cls = corruptionDistortionClass(run)
  if (!cls) return null
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[2] ${cls}`}
      aria-hidden
    />
  )
}
