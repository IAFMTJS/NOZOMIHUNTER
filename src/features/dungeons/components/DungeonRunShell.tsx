"use client"

import type { ReactNode } from "react"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { getDungeonThemeArt } from "@/config/dungeonThemeArt"
import { dungeonRunShellClass } from "@/systems/dungeons/dungeonPresentationSystem"

interface DungeonRunShellProps {
  run: DungeonRunContract
  children: ReactNode
  /** Hide decorative layers during tight encounter focus */
  minimal?: boolean
}

export function DungeonRunShell({ run, children, minimal }: DungeonRunShellProps) {
  const art = getDungeonThemeArt(run.dungeon.theme)

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-panel)] ${dungeonRunShellClass(run)}`}
    >
      {!minimal && (
        <>
          <div
            className={`pointer-events-none absolute inset-0 ${art.gradientClass}`}
            aria-hidden
          />
          <div
            className={`pointer-events-none absolute inset-0 ${art.vignetteClass}`}
            aria-hidden
          />
          <div className="nozomi-dungeon-scanlines pointer-events-none absolute inset-0" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(ellipse 50% 40% at 50% 0%, ${art.accentGlow}, transparent 70%)`,
            }}
            aria-hidden
          />
        </>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  )

}
