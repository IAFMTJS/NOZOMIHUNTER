"use client"

import { HunterPage } from "@/components/layout/HunterPage"
import { Panel } from "@/components/ui/Panel"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { listArchiveEntries } from "@/systems/archive/archiveSystem"

export function ArchiveClient() {
  const player = usePlayerStore((s) => s.player)
  const entries = listArchiveEntries(player)

  return (
    <HunterPage>
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Black Archive</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Recovered records — some entries resist translation
        </p>
      </div>
      <div className="mt-4 space-y-3" data-testid="archive-entries">
        {entries.map((entry) => (
          <Panel key={entry.id} tone={entry.locked ? "inset" : "default"}>
            <p className="font-display text-sm font-semibold text-[var(--foreground)]">
              {entry.title}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{entry.teaser}</p>
            {entry.locked && entry.lockReason && (
              <p className="mt-2 text-xs text-[var(--warning)]">{entry.lockReason}</p>
            )}
          </Panel>
        ))}
      </div>
    </HunterPage>
  )
}
