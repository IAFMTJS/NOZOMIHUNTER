"use client"

import { useState } from "react"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { GameAssetImage } from "@/components/ui/GameAssetImage"
import type { PlayerContract } from "@/contracts/player-contract"
import { checkPrestigeEligibility } from "@/systems/progression/prestigeSystem"
import { applyPrestigeReset } from "@/services/supabase/prestigeRepository"
import { usePlayerStore } from "@/stores/usePlayerStore"

export function PrestigePanel({ player }: { player: PlayerContract }) {
  const eligibility = checkPrestigeEligibility(player)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (player.rank !== "SSS" && (player.progression.prestigeCount ?? 0) === 0) {
    return null
  }

  async function onPrestige() {
    setBusy(true)
    setError(null)
    try {
      const next = await applyPrestigeReset(player)
      usePlayerStore.getState().setPlayer(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prestige failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel tone="inset" className="mt-4 overflow-hidden !p-0">
      <div className="relative h-24 w-full">
        <GameAssetImage assetKey="season.fracture-week.banner" alt="" fill />
      </div>
      <div className="p-4">
        <p className="font-display text-sm text-[var(--foreground)]">Prestige registry</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {eligibility.reason} · Completed: {eligibility.prestigeCount}
        </p>
        {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
        <Button
          variant="cta"
          className="mt-3 w-full"
          disabled={!eligibility.eligible || busy}
          onClick={() => void onPrestige()}
        >
          {busy ? "Resetting…" : "Prestige reset"}
        </Button>
      </div>
    </Panel>
  )
}
