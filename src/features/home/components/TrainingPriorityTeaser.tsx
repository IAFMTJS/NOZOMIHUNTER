"use client"

import { useEffect } from "react"
import Link from "next/link"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { Button } from "@/components/ui/Button"

interface TrainingPriorityTeaserProps {
  modeId: GameModeId
}

export function TrainingPriorityTeaser({ modeId }: TrainingPriorityTeaserProps) {
  const def = GAME_MODE_REGISTRY[modeId]

  useEffect(() => {
    eventBus.emit(GAME_EVENTS.TRAINING_PRIORITY_SHOWN, { modeId })
  }, [modeId])

  return (
    <Link
      href="/training"
      className="block rounded-xl border border-[var(--reward)]/30 bg-[var(--overlay-subtle)] p-4"
    >
      <p className="text-[10px] uppercase tracking-widest text-[var(--reward)]">
        Today&apos;s priority
      </p>
      <p className="mt-1 font-display text-lg text-[var(--foreground)]">{def.label}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">Recommended drill · +discipline on clear</p>
      <Button variant="subtle" className="mt-3 w-full pointer-events-none">
        Open training
      </Button>
    </Link>
  )
}
