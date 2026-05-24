"use client"

import type { DungeonRunContract, ExplorationAction } from "@/contracts/dungeon-contract"
import { Button } from "@/components/ui/Button"
import {
  explorationBeatLabel,
  isReadyToEngage,
  sectorIntelHint,
} from "@/systems/dungeons/explorationSystem"

interface ExplorationLayerProps {
  run: DungeonRunContract
  disabled?: boolean
  statusLine?: string | null
  onAdvance: (action: ExplorationAction) => Promise<void>
  onEngage: () => Promise<void>
}

export function ExplorationLayer({
  run,
  disabled,
  statusLine,
  onAdvance,
  onEngage,
}: ExplorationLayerProps) {
  const beat = run.explorationBeat ?? "APPROACH"
  const progress = run.explorationProgress ?? 0
  const ready = isReadyToEngage(run)
  const intel = sectorIntelHint(run)

  return (
    <div className="nozomi-embedded flex flex-col gap-4 rounded-[var(--radius-panel)] p-4">
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-black/40 p-4">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/10 to-transparent"
          aria-hidden
        />
        <p className="relative text-xs uppercase tracking-[0.24em] text-[var(--accent-bright)]">
          Corridor depth
        </p>
        <p className="relative mt-1 font-display text-lg text-[var(--foreground)]">
          {explorationBeatLabel(beat)}
        </p>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="relative mt-2 text-xs tabular-nums text-[var(--muted)]">
          Transit {progress}%
        </p>
      </div>

      {statusLine && (
        <p className="text-sm italic text-[var(--muted)]">&ldquo;{statusLine}&rdquo;</p>
      )}

      {intel && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs text-[var(--accent-bright)]">
          {intel}
        </p>
      )}

      {!ready ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            disabled={disabled}
            className="flex-1"
            onClick={() => void onAdvance("LISTEN")}
          >
            Listen
          </Button>
          <Button
            variant="primary"
            disabled={disabled}
            className="flex-1"
            onClick={() => void onAdvance("PUSH")}
          >
            Push forward
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          disabled={disabled}
          className="w-full !py-3 shadow-[0_0_16px_var(--glow-accent)]"
          onClick={() => void onEngage()}
        >
          Breach sector
        </Button>
      )}
    </div>
  )
}
