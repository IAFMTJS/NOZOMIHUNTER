"use client"

import type { DungeonAction } from "@/contracts/dungeon-contract"
import { Button } from "@/components/ui/Button"
import { unlockedActionsForLevel } from "@/systems/dungeons/dungeonActionSystem"

const ACTION_LABELS: Record<DungeonAction, string> = {
  STRIKE: "Strike (meaning)",
  SEAL: "Seal (reading)",
  COUNTER: "Counter (Japanese)",
  FOCUS: "Focus (hint tax)",
  ECHO: "Echo",
  TRACE: "Trace",
}

interface DungeonActionBarProps {
  playerLevel: number
  selected?: DungeonAction
  disabled?: boolean
  onSelect: (action: DungeonAction) => Promise<void>
}

export function DungeonActionBar({
  playerLevel,
  selected,
  disabled,
  onSelect,
}: DungeonActionBarProps) {
  const unlocked = unlockedActionsForLevel(playerLevel).filter((a) =>
    ["STRIKE", "SEAL", "FOCUS", "COUNTER"].includes(a)
  )

  return (
    <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Combat actions">
      {unlocked.map((action) => (
        <Button
          key={action}
          variant={selected === action ? "primary" : "ghost"}
          disabled={disabled}
          className="text-xs"
          onClick={() => onSelect(action)}
        >
          {ACTION_LABELS[action]}
        </Button>
      ))}
    </div>
  )
}
