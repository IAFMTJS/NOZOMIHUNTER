"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/Button"
import { startTrainingMission } from "@/features/training/services/trainingLifecycle"
import type { TrainingMissionKind } from "@/systems/training/trainingMissionSystem"

export function TrainingClient() {
  const router = useRouter()
  const { user, player } = useHunterSession()
  const [busy, setBusy] = useState(false)

  async function deploy(kind: TrainingMissionKind) {
    if (!user?.id) return
    setBusy(true)
    try {
      const quest = await startTrainingMission(user.id, kind)
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
          Repeatable practice — safe progression when contracts stall.
        </p>
      </div>

      <GlassCard className="space-y-3 p-4">
        <p className="text-sm text-[var(--foreground)]">Vocabulary stabilization</p>
        <p className="text-xs text-[var(--muted)]">
          Short word hunt. Raises vocabulary stat on completion.
        </p>
        <Button disabled={busy} onClick={() => void deploy("vocabulary")}>
          Start drill
        </Button>
      </GlassCard>

      {player.level >= 2 && (
        <GlassCard className="space-y-3 p-4">
          <p className="text-sm text-[var(--foreground)]">Listening calibration</p>
          <p className="text-xs text-[var(--muted)]">
            Signal decode practice. Raises listening stat on completion.
          </p>
          <Button disabled={busy} onClick={() => void deploy("listening")}>
            Start drill
          </Button>
        </GlassCard>
      )}
    </HunterPage>
  )
}
