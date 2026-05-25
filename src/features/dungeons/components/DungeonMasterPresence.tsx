"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { resolvePresenceForUi } from "@/systems/presentation/dungeonMasterPresentation"
import { MasterDialogueLine } from "./MasterDialogueLine"

interface DungeonMasterPresenceProps {
  run: DungeonRunContract
  minimal?: boolean
}

export function DungeonMasterPresence({ run, minimal }: DungeonMasterPresenceProps) {
  const presence = resolvePresenceForUi(run)
  if (minimal && presence.awarenessTier < 50) return null

  return (
    <div
      className={`nozomi-master-presence mb-2 ${presence.cssClass} ${presence.presenceClass}`}
      aria-label={`${presence.displayName} presence ${presence.awarenessTier}%`}
    >
      <div className="flex items-center gap-2">
        <span
          className="nozomi-master-crest font-display text-lg leading-none text-[var(--accent-bright)]"
          aria-hidden
        >
          {presence.crestGlyph}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
            {presence.domainLabel}
          </p>
          {presence.awarenessTier >= 50 && (
            <p className="truncate text-xs text-[var(--foreground)]">
              {presence.displayName}
            </p>
          )}
        </div>
        {presence.awarenessTier >= 25 && (
          <span className="text-[10px] tabular-nums text-[var(--danger)]">
            {presence.awarenessTier}%
          </span>
        )}
      </div>
      {presence.awarenessTier >= 50 && presence.dialogueLine && (
        <div className="mt-2 border-t border-[var(--border-subtle)]/50 pt-2">
          <MasterDialogueLine
            line={presence.dialogueLine}
            masterName={presence.awarenessTier >= 75 ? presence.displayName : undefined}
          />
        </div>
      )}
      {presence.awarenessTier >= 75 && (
        <div className="nozomi-master-silhouette pointer-events-none absolute -right-4 top-0 h-16 w-16 opacity-30" aria-hidden />
      )}
    </div>
  )
}
