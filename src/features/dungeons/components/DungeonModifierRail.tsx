"use client"

import type { DungeonModifierContract } from "@/contracts/game-mode-contract"

interface DungeonModifierRailProps {
  modifier?: DungeonModifierContract
  modifiers?: DungeonModifierContract[]
}

export function DungeonModifierRail({ modifier, modifiers }: DungeonModifierRailProps) {
  const list = modifier ? [modifier] : (modifiers ?? [])
  if (list.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((m) => (
        <span
          key={m.id}
          className="rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--accent-bright)]"
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}
