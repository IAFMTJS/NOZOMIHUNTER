"use client"

import Link from "next/link"
import { HunterPage } from "@/components/layout/HunterPage"
import { Panel } from "@/components/ui/Panel"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { buildWorldMapNodes } from "@/systems/world/worldMapSystem"

export function WorldMapClient() {
  const player = usePlayerStore((s) => s.player)
  const nodes = buildWorldMapNodes(player)

  return (
    <HunterPage>
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Sector map</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Corridor network — locked routes flicker until cleared
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="world-map-grid">
        {nodes.map((node) => (
          <Panel
            key={node.key}
            tone={node.corrupted ? "danger" : "default"}
            className={node.locked ? "opacity-60" : ""}
          >
            <p className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">
              {node.name}
            </p>
            {node.hint && (
              <p className="mt-1 text-xs text-[var(--muted)]">{node.hint}</p>
            )}
            {!node.locked && (
              <Link
                href={node.href}
                className="mt-3 inline-block text-xs text-[var(--accent-bright)] hover:underline"
              >
                Open sector briefing →
              </Link>
            )}
          </Panel>
        ))}
      </div>
    </HunterPage>
  )
}
