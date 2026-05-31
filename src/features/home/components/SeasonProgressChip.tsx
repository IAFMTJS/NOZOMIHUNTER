"use client"

import { useEffect, useState } from "react"
import { StatusChip } from "@/components/ui/StatusChip"
import { getPrimarySeason, resolveNarrativePhase } from "@/config/seasonConfig"
import { buildSeasonProgressView } from "@/systems/live/seasonProgressSystem"
import { loadSeasonProgress } from "@/services/supabase/seasonProgressRepository"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"
import type { PlayerContract } from "@/contracts/player-contract"

export function SeasonProgressChip({ player }: { player: PlayerContract }) {
  const season = getPrimarySeason()
  const [stored, setStored] = useState<{ points: number; tier: number } | null>(null)

  useEffect(() => {
    void loadSeasonProgress(player.id).then(setStored)
  }, [player.id])

  if (!season) return null

  const view = buildSeasonProgressView(player, stored)
  if (!view) return null

  const storyProgress = resolveStoryProgress(player)
  const phase = resolveNarrativePhase(storyProgress.completedBeatIds.length)

  return (
    <StatusChip
      label={`${season.label} · ${phase.title} · T${view.tier}`}
      tone="warning"
    />
  )
}
