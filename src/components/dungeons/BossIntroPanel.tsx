"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { GameAssetImage } from "@/components/ui/GameAssetImage"
import { Panel } from "@/components/ui/Panel"

interface BossIntroPanelProps {
  run: DungeonRunContract
}

export function bossIntroAssetKey(run: DungeonRunContract): string {
  if (run.dungeon.theme === "SHADOW_ARCHIVE") return "boss.shadow-archivist"
  if (run.dungeon.theme === "ABYSS_CORE") return "boss.void-priest"
  return "boss.neon-warden"
}

export function BossIntroPanel({ run }: BossIntroPanelProps) {
  const boss = run.dungeon.boss
  const phase = boss?.phaseSpecs?.[run.bossPhase]
  const weakness = phase?.label

  return (
    <Panel tone="boss" className="nozomi-vfx-boss-frame relative mb-3 overflow-hidden !p-4">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <GameAssetImage assetKey={bossIntroAssetKey(run)} alt="" fill />
      </div>
      <div className="relative z-[1]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--danger)]">
          Warden encounter
        </p>
        <p className="mt-1 font-display text-lg text-[var(--foreground)]">
          {boss?.name ?? "Sector warden"}
        </p>
        {weakness && (
          <p className="mt-2 text-xs text-[var(--accent-bright)]">
            Weakness intel: {weakness}
          </p>
        )}
      </div>
    </Panel>
  )
}
