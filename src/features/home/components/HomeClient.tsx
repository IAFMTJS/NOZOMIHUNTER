"use client"

import { useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { HunterPowerSummary } from "@/components/hunter/HunterPowerSummary"
import { StatusChip } from "@/components/ui/StatusChip"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import {
  buildAlmostThereObjective,
  buildProximityChips,
  hunterPowerPercentileLabel,
} from "@/systems/progression/almostThereSystem"
import { buildSectorCorruptionView } from "@/systems/world/sectorCorruptionSystem"
import { pickDailyTrainingPriority } from "@/systems/training/trainingPrioritySystem"
import { irisWarningLine } from "@/systems/messaging/npcMessageSystem"
import { buildOperationalFeed } from "@/systems/home/operationalFeedSystem"
import {
  homeWhisperEligible,
  pickHomeWhisper,
} from "@/systems/home/homeWhispersSystem"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"
import { OperationalAlertRail } from "@/features/home/components/OperationalAlertRail"
import { ContractRotationRail } from "@/features/home/components/ContractRotationRail"
import { InstabilityFeed } from "@/features/home/components/InstabilityFeed"
import { ActiveBoostsChip } from "@/features/home/components/ActiveBoostsChip"
import { SectorActivityTicker } from "@/features/home/components/SectorActivityTicker"
import { AnomalyChip } from "@/features/home/components/AnomalyChip"
import { ActiveObjectiveCard } from "@/features/home/components/ActiveObjectiveCard"
import { SectorCorruptionCard } from "@/features/home/components/SectorCorruptionCard"
import { ProgressProximityRail } from "@/features/home/components/ProgressProximityRail"
import { NpcMessageCard } from "@/features/home/components/NpcMessageCard"
import { TrainingPriorityTeaser } from "@/features/home/components/TrainingPriorityTeaser"
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
  const power = computeHunterPower(player)
  const sector = buildSectorCorruptionView(player, activeQuests, seed)
  const objective = buildAlmostThereObjective(player, activeQuests)
  const chips = buildProximityChips(
    player,
    sector.corruptionPercent,
    sector.breachDelta,
    activeQuests
  )
  const priorityMode = pickDailyTrainingPriority(player, seed.slice(-10))
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
      {homeWhisper && (
        <p
          className="text-center font-display text-sm tracking-wide text-[var(--accent-bright)]/90"
          aria-label="Signal whisper"
        >
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
          <span className="text-xs text-[var(--muted)]">Level {player.level}</span>
          <span className="text-xs text-[var(--muted)]">
            · Discipline {player.progression.discipline}
          </span>
        </div>
      </div>

      <ActiveObjectiveCard objective={objective} />
      <SectorCorruptionCard view={sector} />
      <HunterPowerSummary
        power={power}
        percentileLabel={hunterPowerPercentileLabel(power.total)}
      />
      <ProgressProximityRail chips={chips} />
      <NpcMessageCard message={irisLine} />
      <TrainingPriorityTeaser modeId={priorityMode} />

      {feed.anomalies.length > 0 && (
        <AnomalyChip anomalies={feed.anomalies} />
      )}

      <button
        type="button"
        className="w-full text-left text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        onClick={() => setOpsExpanded((v) => !v)}
      >
        {opsExpanded ? "▼ Hide operational feed" : "▶ Operational feed"}
      </button>
      {opsExpanded && (
        <>
          <OperationalAlertRail alerts={feed.alerts} />
          <InstabilityFeed items={feed.instability} />
          <ActiveBoostsChip player={player} countOverride={feed.activeBoostCount} />
          <SectorActivityTicker items={feed.sectorActivity} />
          <ContractRotationRail items={feed.contractRotation} />
        </>
      )}

      <Link
        href="/contracts"
        className="block text-center text-xs uppercase tracking-widest text-[var(--accent-bright)] hover:underline"
      >
        Open contract board
      </Link>
      <CorruptionAlertOverlay band={sector.band} />
    </HunterPage>
  )
}
