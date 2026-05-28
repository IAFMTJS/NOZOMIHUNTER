"use client"

import { useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"
import { XPBar } from "@/components/XPBar"
import { CorruptionWidget } from "@/components/hunter/CorruptionWidget"
import { SynchronizationStatus } from "@/components/hunter/SynchronizationStatus"
import { SyncDisciplineChestTeaser } from "@/components/hunter/SyncDisciplineChestTeaser"
import { NextGateForecast } from "@/components/hunter/NextGateForecast"
import { ReadinessSummary } from "@/components/hunter/ReadinessSummary"
import { HunterPowerSummary } from "@/components/hunter/HunterPowerSummary"
import { StatusChip } from "@/components/ui/StatusChip"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { selectSystemMessage, systemMessageSubline } from "@/systems/messaging/systemMessagingSystem"
import { getTrackedQuest } from "@/systems/quests/contractTrackingSystem"
import { buildOperationalFeed } from "@/systems/home/operationalFeedSystem"
import { OperationalAlertRail } from "@/features/home/components/OperationalAlertRail"
import { ContractRotationRail } from "@/features/home/components/ContractRotationRail"
import { InstabilityFeed } from "@/features/home/components/InstabilityFeed"
import { ActiveBoostsChip } from "@/features/home/components/ActiveBoostsChip"
import { SectorActivityTicker } from "@/features/home/components/SectorActivityTicker"
import { AnomalyChip } from "@/features/home/components/AnomalyChip"
import { UI_TOKENS } from "@/config/uiTokens"

export function HomeClient() {
  const { player, activeQuests, hunterPresentation, readiness, forecast } =
    useHunterSession()
  const [opsExpanded, setOpsExpanded] = useState(false)

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading hunter status…</p>
      </HunterPage>
    )
  }

  const progress = xpProgressInCurrentLevel(player.xp, player.level)
  const seed = `${player.id}:${new Date().toISOString().slice(0, 10)}`
  const systemLine =
    selectSystemMessage({ player, activeQuests, seed }) ??
    "The system is observing."
  const subline = systemMessageSubline(player)
  const tracked = getTrackedQuest(activeQuests, player)
  const power = computeHunterPower(player)
  const feed = buildOperationalFeed(player, activeQuests, seed)

  return (
    <HunterPage
      className={`nozomi-screen-home ${UI_TOKENS.sectionGap} ${hunterPresentation.shellClass}`.trim()}
    >
      <div className="nozomi-embedded rounded-2xl p-4">
        <HunterIdentityBlock
          player={player}
          portraitClassName={hunterPresentation.portraitClass}
          auraClassName={hunterPresentation.identityAuraClass}
        />
        <p className="mt-3 font-display text-sm italic text-[var(--muted)]">
          &ldquo;{systemLine}&rdquo;
        </p>
        <div className="mt-3">
          <SystemMessageRail message={subline} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <StatusChip label={`Rank ${player.rank}`} tone="accent" />
          <span className="text-xs text-[var(--muted)]">Level {player.level}</span>
        </div>
        <div className="mt-3">
          <XPBar
            currentXP={progress.current}
            requiredXP={progress.required}
            level={player.level}
            xpDebt={player.penalties.xpDebt}
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full text-left text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        onClick={() => setOpsExpanded((v) => !v)}
      >
        {opsExpanded ? "▼ Hide operational feed" : "▶ Operational feed (calm hub)"}
      </button>
      {opsExpanded && (
        <>
          <OperationalAlertRail alerts={feed.alerts} />
          <AnomalyChip anomalies={feed.anomalies} />
          <InstabilityFeed items={feed.instability} />
          <ActiveBoostsChip player={player} countOverride={feed.activeBoostCount} />
          <SectorActivityTicker items={feed.sectorActivity} />
          <ContractRotationRail items={feed.contractRotation} />
        </>
      )}

      <HunterPowerSummary power={power} />

      <CorruptionWidget penalties={player.penalties} />

      <div className="nozomi-embedded rounded-xl p-4">
        <SynchronizationStatus synchronization={player.synchronization} />
        <SyncDisciplineChestTeaser chainDays={player.synchronization.chainDays} />
      </div>

      {readiness && <ReadinessSummary readiness={readiness} />}
      {forecast && <NextGateForecast forecast={forecast} />}

      <Link
        href="/training"
        className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--overlay-subtle)] p-4 transition-colors hover:border-[var(--accent)]/40"
      >
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
          Training channel
        </p>
        <p className="mt-1 text-sm text-[var(--foreground)]">
          Repeatable drills — safe stat progression
        </p>
      </Link>

      {tracked && (
        <Link
          href={`/contracts/${tracked.id}`}
          className="block rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-dim)] p-4 transition-colors hover:border-[var(--accent)]"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--accent-bright)]">
            Tracked contract
          </p>
          <p className="mt-1 font-display text-lg text-[var(--foreground)]">
            {tracked.title}
          </p>
        </Link>
      )}
    </HunterPage>
  )
}
