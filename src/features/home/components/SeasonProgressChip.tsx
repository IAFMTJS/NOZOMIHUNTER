"use client"

import { useEffect, useState } from "react"
import { StatusChip } from "@/components/ui/StatusChip"
import { getActiveSeason } from "@/config/seasonConfig"
import { buildSeasonProgressView } from "@/systems/live/seasonProgressSystem"
import { loadSeasonProgress } from "@/services/supabase/seasonProgressRepository"
import type { PlayerContract } from "@/contracts/player-contract"

export function SeasonProgressChip({ player }: { player: PlayerContract }) {
  const season = getActiveSeason()
  const [stored, setStored] = useState<{ points: number; tier: number } | null>(null)

  useEffect(() => {
    void loadSeasonProgress(player.id).then(setStored)
  }, [player.id])

  if (!season) return null

  const view = buildSeasonProgressView(player, stored)
  if (!view) return null

  return (
    <StatusChip
      label={`${season.label} T${view.tier} · ${view.progressPercent}%`}
      tone="warning"
    />
  )
}
