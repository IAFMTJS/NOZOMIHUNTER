"use client"

import { useState } from "react"
import Link from "next/link"
import { HunterPage } from "@/components/layout/HunterPage"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { buildWorldMapNodes } from "@/systems/world/worldMapSystem"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

const HEX_LAYOUT: { key: string; top: string; left: string }[] = [
  { key: "dungeon:neon-corridor", top: "12%", left: "50%" },
  { key: "dungeon:shadow-archive", top: "38%", left: "22%" },
  { key: "dungeon:void-sector", top: "38%", left: "78%" },
  { key: "dungeon:abyss-core", top: "72%", left: "50%" },
]

export function WorldMapClient() {
  const player = usePlayerStore((s) => s.player)
  const nodes = buildWorldMapNodes(player)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  return (
    <HunterPage className="nozomi-screen-map space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Sector map</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Corridor network — select a node to open sector briefing
        </p>
      </div>
      <div
        className="nozomi-hex-map relative mt-6 min-h-[22rem] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--overlay-panel)]"
        data-testid="world-map-grid"
      >
        <GameAssetImage
          assetKey="hero.world.map"
          alt=""
          fill
          className="pointer-events-none opacity-30"
        />
        <div className="relative z-[1] min-h-[22rem]">
        {nodes.map((node) => {
          const pos =
            HEX_LAYOUT.find((h) => h.key === node.key) ??
            HEX_LAYOUT[nodes.indexOf(node) % HEX_LAYOUT.length]
          return (
            <div
              key={node.key}
              className={`absolute w-[42%] max-w-[11rem] -translate-x-1/2 -translate-y-1/2 transition-transform sm:w-40 ${
                node.locked ? "opacity-55" : ""
              } ${node.corrupted ? "nozomi-map-node--corrupted" : ""} ${
                selectedKey === node.key ? "nozomi-map-node--selected z-10" : ""
              }`}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => !node.locked && setSelectedKey(node.key)}
            >
              <div
                className={`rounded-xl border px-3 py-3 text-center transition-shadow ${
                  node.corrupted
                    ? "border-[var(--danger)]/40 bg-[var(--danger)]/10"
                    : "border-[var(--border-subtle)] bg-[var(--surface)]"
                }`}
              >
                <p className="font-display text-xs font-semibold tracking-wide text-[var(--foreground)]">
                  {node.name}
                </p>
                {node.corrupted && (
                  <div className="mx-auto mt-2 h-1 w-full max-w-[6rem] overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full bg-[var(--danger)]"
                      style={{ width: `${node.corruptionIndex}%` }}
                    />
                  </div>
                )}
                {node.hint && (
                  <p className="mt-1 text-[10px] text-[var(--muted)]">{node.hint}</p>
                )}
                {!node.locked && (
                  <Link
                    href={node.href}
                    className="mt-2 inline-block text-[10px] uppercase tracking-wider text-[var(--accent-bright)] hover:underline"
                  >
                    Briefing →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </HunterPage>
  )
}
