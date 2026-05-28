"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { ArcadeCard } from "@/components/ui/cards/ArcadeCard"
import { TRAINING_GAME_MODES } from "@/config/gameModeRegistry"
import { isGameModeUnlocked } from "@/config/gameModeRegistry"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

export function TrainingClient() {
  const router = useRouter()
  const { user, player, setHubView } = useHunterSession()
  const [busy, setBusy] = useState(false)

  async function deploy(mode: GameModeId) {
    if (!user?.id || !player) return
    setBusy(true)
    try {
      const { startTrainingMission } = await import(
        "@/features/training/services/trainingActions"
      )
      const quest = await startTrainingMission(user.id, mode, player.level)
      if (quest) {
        setHubView("hunt")
        router.push("/training")
      }
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
    <HunterPage className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Arcade channel
        </p>
        <h1 className="font-display text-2xl text-[var(--foreground)]">
          Stabilization drills
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Mini-games — no contract stakes. Chain combos for practice XP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TRAINING_GAME_MODES.map((modeId) => {
          const def = GAME_MODE_REGISTRY[modeId]
          const unlocked = isGameModeUnlocked(modeId, player)
          return (
            <ArcadeCard
              key={modeId}
              accent={def.emotion === "DOPAMINE" ? "gold" : "purple"}
            >
              <p className="font-display text-lg text-[var(--foreground)]">
                {def.label}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--accent-bright)]">
                {def.emotion.replace(/_/g, " ")}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {trainingBlurb(modeId)}
              </p>
              <Button
                className="mt-4 w-full"
                variant="cta"
                disabled={busy || !unlocked}
                data-testid={E2E_TEST_IDS.trainingPlay(modeId)}
                onClick={() => void deploy(modeId)}
              >
                {unlocked ? "Play" : `Requires L${def.minLevel}`}
              </Button>
            </ArcadeCard>
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
      return "Mirror operator pacing before the signal decays."
    case "KANA_DASH":
      return "Rapid kana recognition with combo chains."
    case "ECHO_LISTENING":
      return "One playback — rebuild the phrase."
    case "SHADOW_TYPING":
      return "Type before the glyph collapses."
    case "MEMORY_GRID":
      return "Lock matching pairs under pressure."
    case "SURVIVAL_VOCAB":
      return "Endless waves until you break."
    default:
      return "Training simulation."
  }
}
