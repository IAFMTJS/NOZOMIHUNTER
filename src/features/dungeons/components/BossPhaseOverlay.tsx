"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { resolvePresenceForUi } from "@/systems/presentation/dungeonMasterPresentation"
import { bossPhaseBannerCopy } from "@/systems/presentation/dungeonBossPresentation"
import { getBossPhaseSpec } from "@/systems/dungeons/dungeonBossSystem"
import { resolveBossPhaseCount } from "@/systems/dungeons/dungeonV2Helpers"
import type { QuestContract } from "@/contracts/quest-contract"
import { MasterDialogueLine } from "./MasterDialogueLine"

interface BossPhaseOverlayProps {
  quest: QuestContract
  run: DungeonRunContract
}

export function BossPhaseOverlay({ quest, run }: BossPhaseOverlayProps) {
  const presence = resolvePresenceForUi(run)
  const spec = getBossPhaseSpec(quest, run.bossPhase)
  const banner = bossPhaseBannerCopy(
    presence.displayName,
    spec,
    run.bossPhase,
    resolveBossPhaseCount(run)
  )

  return (
    <div className="nozomi-boss-phase-overlay pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-start bg-[var(--overlay-track)] pt-6">
      <span className="nozomi-master-crest mb-2 font-display text-3xl text-[var(--danger)]">
        {presence.crestGlyph}
      </span>
      <p className="font-display text-sm uppercase tracking-[0.35em] text-[var(--foreground)]">
        {presence.displayName}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[var(--danger)]">
        {banner}
      </p>
      {run.masterDialogueLine && (
        <div className="pointer-events-auto mt-4 max-w-md px-4">
          <MasterDialogueLine line={run.masterDialogueLine} />
        </div>
      )}
    </div>
  )
}
