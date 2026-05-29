"use client"

import type { ArcadeSessionHudViewModel } from "@/systems/presentation/arcadeSessionPresentationSystem"

interface ArcadeSessionHudProps {
  view: ArcadeSessionHudViewModel
}

export function ArcadeSessionHud({ view }: ArcadeSessionHudProps) {
  const ringOffset = 100 - Math.min(100, view.accuracyPercent)

  return (
    <div className="nozomi-arcade-hud mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-[var(--accent)]/25 bg-[var(--overlay-panel)] px-3 py-2">
      <div className="text-center">
        <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Combo</p>
        <p className="font-mono text-lg font-semibold text-[var(--reward)]">x{view.combo}</p>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="relative flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--reward) ${view.accuracyPercent}%, var(--surface) 0)`,
          }}
          aria-label={`Accuracy ${view.accuracyPercent}%`}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--overlay-panel-strong)] font-mono text-xs text-[var(--foreground)]"
            style={{ boxShadow: `inset 0 0 0 2px var(--border-subtle)` }}
          >
            {view.accuracyPercent}%
          </div>
        </div>
        <span className="sr-only">Ring gap {ringOffset}</span>
      </div>
      <div className="text-right">
        <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Score</p>
        <p className="font-mono text-lg font-semibold text-[var(--accent-bright)]">{view.score}</p>
      </div>
    </div>
  )
}
