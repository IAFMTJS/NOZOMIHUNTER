"use client"

import type { DungeonRouteNode } from "@/contracts/dungeon-contract"
import { Button } from "@/components/ui/Button"
import { sectorDangerClass } from "@/systems/presentation/dungeonRunPresentation"

interface DungeonRouteMapProps {
  choices: DungeonRouteNode[]
  disabled?: boolean
  archiveFog?: boolean
  onChoose: (exitId: string) => Promise<void>
}

export function DungeonRouteMap({
  choices,
  disabled,
  archiveFog,
  onChoose,
}: DungeonRouteMapProps) {
  if (choices.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        All breach paths logged. Proceed to warden gate.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent-bright)]">
        Scan route
      </p>
      {choices.map((node, i) => (
        <div
          key={node.id}
          className={`rounded border border-[var(--border-subtle)] p-3 ${sectorDangerClass(node.danger)}`}
        >
          <p className="font-display text-sm text-[var(--foreground)]">
            {String.fromCharCode(65 + i)}: {node.label}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Threat: {node.danger}
            {!archiveFog && ` · Reward: ${node.rewardHint}`}
          </p>
          {node.hazard && (
            <p className="mt-1 text-xs text-[var(--danger)]">Hazard: {node.hazard}</p>
          )}
          <Button
            variant="ghost"
            disabled={disabled}
            className="mt-3 w-full"
            onClick={() => onChoose(node.id)}
          >
            Breach this route
          </Button>
        </div>
      ))}
    </div>
  )
}
