"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { startTrainingMission } from "@/features/training/services/trainingLifecycle"
import { TRAINING_GAME_MODES } from "@/config/gameModeRegistry"
import { isGameModeUnlocked } from "@/config/gameModeRegistry"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import type { GameModeId } from "@/contracts/game-mode-contract"

export function TrainingClient() {
  const router = useRouter()
  const { user, player } = useHunterSession()
  const [busy, setBusy] = useState(false)

  async function deploy(mode: GameModeId) {
    if (!user?.id || !player) return
    setBusy(true)
    try {
      const quest = await startTrainingMission(user.id, mode)
      if (quest) router.push(`/contracts/${quest.id}`)
    } finally {
      setBusy(false)
    }
  }

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading training channel…</p>
      </HunterPage>
    )
  }

  return (
    <HunterPage className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Training channel
        </p>
        <h1 className="font-display text-xl text-[var(--foreground)]">
          Stabilization drills
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Discipline simulations — safe practice without contract stakes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TRAINING_GAME_MODES.map((modeId) => {
          const def = GAME_MODE_REGISTRY[modeId]
          const unlocked = isGameModeUnlocked(modeId, player)
          return (
            <GlassCard key={modeId} className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {def.label}
                </p>
                <StatusChip label={def.emotion} tone="neutral" />
              </div>
              <p className="text-xs text-[var(--muted)]">
                {trainingBlurb(modeId)}
              </p>
              <Button
                disabled={busy || !unlocked}
                onClick={() => void deploy(modeId)}
              >
                {unlocked ? "Start drill" : `Requires L${def.minLevel}`}
              </Button>
            </GlassCard>
          )
        })}
      </div>
    </HunterPage>
  )
}

function trainingBlurb(mode: GameModeId): string {
  switch (mode) {
    case "SIGNAL_CALIBRATION":
      return "Reconstruct distorted radio transmissions."
    case "KANJI_SURGERY":
      return "Stabilize broken kanji seals before corruption leaks."
    case "MEMORY_CASCADE":
      return "High-speed sequence recall — spot the intruder."
    case "SHADOW_ECHO":
      return "Mirror operator pacing and pronunciation."
    default:
      return "Training simulation."
  }
}
