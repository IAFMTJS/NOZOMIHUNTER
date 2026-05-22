"use client"

import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import type { DungeonAccessResult } from "@/systems/dungeons/dungeonAccess"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"

interface DungeonCorridorCardProps {
  definition: DungeonDefinitionConfig
  access: DungeonAccessResult
  disabled?: boolean
  onEnter: (key: string) => void
}

export function DungeonCorridorCard({
  definition,
  access,
  disabled,
  onEnter,
}: DungeonCorridorCardProps) {
  const locked = !access.canEnter

  const chipLabel =
    access.status === "available"
      ? "open"
      : access.status === "locked_level"
        ? `L${access.minLevel}+`
        : access.status === "blocked_active_run"
          ? "busy"
          : "locked"

  const chipTone =
    access.status === "available"
      ? "accent"
      : access.status === "blocked_active_run"
        ? "danger"
        : "neutral"

  return (
    <Panel tone={locked ? "inset" : "default"} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[var(--foreground)]">
            {definition.name}
          </h4>
          <p className="mt-1 text-sm text-[var(--muted)]">{definition.description}</p>
        </div>
        <StatusChip label={chipLabel} tone={chipTone} />
      </div>
      {locked && access.reason ? (
        <p className="text-xs text-[var(--muted)]">{access.reason}</p>
      ) : null}
      <Button
        size="md"
        disabled={disabled || locked}
        onClick={() => onEnter(definition.key)}
      >
        {locked ? "Corridor sealed" : `Enter ${definition.name}`}
      </Button>
    </Panel>
  )
}
