"use client"

import { useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { StatusChip } from "@/components/ui/StatusChip"
import { buildAlmostThereObjective } from "@/systems/progression/almostThereSystem"
import { buildSectorCorruptionView } from "@/systems/world/sectorCorruptionSystem"
import { irisWarningLine } from "@/systems/messaging/npcMessageSystem"
import { buildOperationalFeed } from "@/systems/home/operationalFeedSystem"
import {
  homeWhisperEligible,
  pickHomeWhisper,
} from "@/systems/home/homeWhispersSystem"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"
import { OperationalAlertRail } from "@/features/home/components/OperationalAlertRail"
import { InstabilityFeed } from "@/features/home/components/InstabilityFeed"
import { ActiveBoostsChip } from "@/features/home/components/ActiveBoostsChip"
import { SectorActivityTicker } from "@/features/home/components/SectorActivityTicker"
import { AnomalyChip } from "@/features/home/components/AnomalyChip"
import { ActiveObjectiveCard } from "@/features/home/components/ActiveObjectiveCard"
import { SectorCorruptionCard } from "@/features/home/components/SectorCorruptionCard"
import { NpcMessageCard } from "@/features/home/components/NpcMessageCard"
import { UI_TOKENS } from "@/config/uiTokens"
import { CorruptionAlertOverlay } from "@/components/home/CorruptionAlertOverlay"
import { SeasonProgressChip } from "@/features/home/components/SeasonProgressChip"
import { dailyMilestoneProgress } from "@/systems/quests/dailyMilestoneSystem"

export function HomeClient() {
  const { player, activeQuests, hunterPresentation } = useHunterSession()
  const [opsExpanded, setOpsExpanded] = useState(false)

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading hunter status…</p>
      </HunterPage>
    )
  }

  const seed = `${player.id}:${new Date().toISOString().slice(0, 10)}`
  const sector = buildSectorCorruptionView(player, activeQuests, seed)
  const objective = buildAlmostThereObjective(player, activeQuests)
  const feed = buildOperationalFeed(player, activeQuests, seed)
  const irisLine = irisWarningLine(sector.band)
  const dailyMilestone = dailyMilestoneProgress(activeQuests, player.id)
  const storyProgress = resolveStoryProgress(player)
  const showWhisper = homeWhisperEligible(storyProgress.irisTrustTier)
  const homeWhisper = showWhisper ? pickHomeWhisper(seed) : null

  return (
    <HunterPage
      className={`nozomi-screen-home nozomi-screen-home--command ${UI_TOKENS.sectionGap} ${hunterPresentation.shellClass}`.trim()}
    >
      <h1 className="sr-only">Command node</h1>

      {homeWhisper && (
        <p className="text-center font-display text-sm tracking-wide text-[var(--accent-bright)]/90">
          {homeWhisper}
        </p>
      )}

      {feed.storyAlerts.length > 0 && (
        <OperationalAlertRail alerts={feed.storyAlerts} />
      )}

      <div className="nozomi-embedded rounded-xl p-3">
        <HunterIdentityBlock
          player={player}
          portraitClassName={hunterPresentation.portraitClass}
          auraClassName={hunterPresentation.identityAuraClass}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip label={`Rank ${player.rank}`} tone="accent" />
          <SeasonProgressChip player={player} />
          {dailyMilestone.completed > 0 && (
            <StatusChip
              label={`Daily clears ${dailyMilestone.completed}/${dailyMilestone.target}`}
              tone={dailyMilestone.bonusReady ? "accent" : "neutral"}
            />
          )}
        </div>
      </div>

      <ActiveObjectiveCard objective={objective} />
      <SectorCorruptionCard view={sector} />
      <NpcMessageCard message={irisLine} />

      <button
        type="button"
        className="w-full text-left text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        onClick={() => setOpsExpanded((v) => !v)}
      >
        {opsExpanded ? "▼ Hide operational feed" : "▶ Operational feed"}
      </button>
      {opsExpanded && (
        <>
          <OperationalAlertRail alerts={feed.alerts} />
          {feed.anomalies.length > 0 && <AnomalyChip anomalies={feed.anomalies} />}
          <InstabilityFeed items={feed.instability} />
          <ActiveBoostsChip player={player} countOverride={feed.activeBoostCount} />
          <SectorActivityTicker items={feed.sectorActivity} />
        </>
      )}

      <Link
        href="/contracts"
        className="block text-center text-xs uppercase tracking-widest text-[var(--accent-bright)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        Open missions
      </Link>
      <CorruptionAlertOverlay band={sector.band} />
    </HunterPage>
  )
}
