"use client"

import type { PlayerContract } from "@/contracts/player-contract"
import { activeBoostsForPlayer } from "@/systems/economy/boostSystem"
import { StatusChip } from "@/components/ui/StatusChip"

interface ActiveBoostsChipProps {
  player: PlayerContract
  countOverride?: number
}

export function ActiveBoostsChip({ player, countOverride }: ActiveBoostsChipProps) {
  const boosts = activeBoostsForPlayer(player)
  const count = countOverride ?? boosts.length
  if (count <= 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusChip label={`${count} active boost${count === 1 ? "" : "s"}`} tone="accent" />
      {boosts.slice(0, 3).map((b) => (
        <span
          key={`${b.itemKey}-${b.effectType}`}
          className="text-[10px] uppercase tracking-wider text-[var(--muted)]"
        >
          {b.effectType.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  )
}
