"use client"

import type { SectorMapNode } from "@/systems/dungeons/dungeonSectorMapSystem"
import { StatusChip } from "@/components/ui/StatusChip"
import { Button } from "@/components/ui/Button"

interface SectorMapRailProps {
  nodes: SectorMapNode[]
  disabled?: boolean
  onSelectCorridor: (dungeonKey: string) => void
}

export function SectorMapRail({
  nodes,
  disabled,
  onSelectCorridor,
}: SectorMapRailProps) {
  return (
    <div className="nozomi-sector-map relative flex flex-col gap-0 py-2">
      <p className="mb-4 font-display text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        Corridor breach map
      </p>
      <ul className="relative flex flex-col gap-0">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1
          const chipTone = node.access.canEnter
            ? node.readinessBlocked
              ? "danger"
              : "accent"
            : node.isNextGate
              ? "danger"
              : "neutral"

          return (
            <li key={node.dungeonKey} className="relative flex gap-4 pb-8">
              {!isLast && (
                <div
                  className="absolute left-[1.125rem] top-10 bottom-0 w-px bg-gradient-to-b from-[var(--accent)]/40 to-transparent"
                  aria-hidden
                />
              )}

              <div className="relative z-[1] flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-semibold ${
                    node.access.canEnter && !node.readinessBlocked
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-bright)]"
                      : node.isNextGate
                        ? "border-[var(--danger)]/50 bg-[var(--danger)]/10 text-[var(--danger)]"
                        : "border-[var(--border-subtle)] bg-black/40 text-[var(--muted)]"
                  }`}
                >
                  {node.breachLabel}
                </div>
                {node.isNextGate && (
                  <span className="mt-1 text-[9px] uppercase tracking-wider text-[var(--danger)]">
                    Next
                  </span>
                )}
              </div>

              <div className="nozomi-embedded min-w-0 flex-1 rounded-[var(--radius-panel)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display text-base font-semibold text-[var(--foreground)]">
                      {node.name}
                    </h4>
                    <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                      Depth {node.depth + 1} · Danger D{node.dangerTier}
                    </p>
                  </div>
                  <StatusChip
                    label={
                      node.access.canEnter
                        ? node.readinessBlocked
                          ? "risky"
                          : "open"
                        : node.access.status === "locked_level"
                          ? `L${node.access.minLevel}+`
                          : "sealed"
                    }
                    tone={chipTone}
                  />
                </div>

                {!node.access.canEnter && node.access.reason && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {node.access.reason}
                  </p>
                )}

                {node.readinessBlocked && (
                  <p className="mt-2 text-xs text-[var(--warning)]">
                    Readiness {node.playerReadiness}% — advisory{" "}
                    {node.recommendedReadiness}% before breach.
                  </p>
                )}

                <Button
                  size="md"
                  className="mt-4 w-full sm:w-auto"
                  disabled={
                    disabled ||
                    !node.access.canEnter ||
                    node.access.status === "blocked_active_run"
                  }
                  onClick={() => onSelectCorridor(node.dungeonKey)}
                >
                  {!node.access.canEnter
                    ? "Corridor sealed"
                    : node.readinessBlocked
                      ? `Deploy (${node.name}) — risky`
                      : `Deploy to ${node.name}`}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
