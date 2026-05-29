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
      {choices.map((node, i) => {
        const isRecovery = node.label.toLowerCase().includes("recovery")
        return (
        <div
          key={node.id}
          className={`rounded border border-[var(--border-subtle)] p-3 ${sectorDangerClass(node.danger)} ${
            isRecovery ? "nozomi-recovery-alcove border-[var(--success)]/40" : ""
          }`}
        >
          <p className="font-display text-sm text-[var(--foreground)]">
            {isRecovery ? "Recovery alcove" : `${String.fromCharCode(65 + i)}: ${node.label}`}
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
            {isRecovery ? "Stabilize in alcove" : "Breach this route"}
          </Button>
        </div>
      )})}
    </div>
  )
}
