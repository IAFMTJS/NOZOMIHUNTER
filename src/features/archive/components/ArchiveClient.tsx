"use client"

import Link from "next/link"
import { HunterPage } from "@/components/layout/HunterPage"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { listArchiveEntries } from "@/systems/archive/archiveSystem"
import { resolveArchiveContractLink } from "@/systems/archive/archiveContractSystem"

export function ArchiveClient() {
  const player = usePlayerStore((s) => s.player)
  const entries = listArchiveEntries(player)

  return (
    <HunterPage>
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Black Archive</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Recovered records — linked contracts unlock deeper extraction
        </p>
      </div>
      <div className="mt-4 space-y-3" data-testid="archive-entries">
        {entries.map((entry) => {
          const contractLink = resolveArchiveContractLink(entry, player)
          return (
            <Panel key={entry.id} tone={entry.locked ? "inset" : "default"}>
              <p className="font-display text-sm font-semibold text-[var(--foreground)]">
                {entry.title}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{entry.teaser}</p>
              {!entry.locked && entry.loreExcerpt && (
                <p className="mt-2 border-l-2 border-[var(--accent)] pl-3 font-mono text-xs leading-relaxed text-[var(--foreground)] opacity-90">
                  {entry.loreExcerpt}
                </p>
              )}
              {entry.locked && entry.lockReason && (
                <p className="mt-2 text-xs text-[var(--warning)]">{entry.lockReason}</p>
              )}
              {contractLink && (
                <div className="mt-3">
                  {contractLink.available ? (
                    <Link href={contractLink.href}>
                      <Button variant="cta" size="sm">
                        {contractLink.label}
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-xs text-[var(--muted)]">
                      {contractLink.reason ?? "Contract sealed"}
                    </p>
                  )}
                </div>
              )}
            </Panel>
          )
        })}
      </div>
    </HunterPage>
  )
}
