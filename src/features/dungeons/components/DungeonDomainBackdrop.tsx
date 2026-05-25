"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { domainBackdropClasses } from "@/systems/presentation/dungeonDomainPresentation"

interface DungeonDomainBackdropProps {
  run: DungeonRunContract
  minimal?: boolean
}

export function DungeonDomainBackdrop({ run, minimal }: DungeonDomainBackdropProps) {
  if (minimal) return null
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${domainBackdropClasses(run)}`}
      aria-hidden
    />
  )
}
