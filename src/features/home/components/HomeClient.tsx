"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"
import { XPBar } from "@/components/XPBar"
import { CorruptionWidget } from "@/components/hunter/CorruptionWidget"
import { SynchronizationStatus } from "@/components/hunter/SynchronizationStatus"
import { NextGateForecast } from "@/components/hunter/NextGateForecast"
import { ReadinessSummary } from "@/components/hunter/ReadinessSummary"
import { StatusChip } from "@/components/ui/StatusChip"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { selectSystemMessage, systemMessageSubline } from "@/systems/messaging/systemMessagingSystem"
import { getTrackedQuest } from "@/systems/quests/missionTrackingSystem"
import { SYNCHRONIZATION_CONFIG } from "@/config/synchronizationConfig"

export function HomeClient() {
  const { player, activeQuests, hunterPresentation, readiness, forecast } =
    useHunterSession()

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
  const nextMilestone = SYNCHRONIZATION_CONFIG.MILESTONES.find(
    (m) => player.synchronization.chainDays < m.days
  )

  return (
    <HunterPage className={hunterPresentation.shellClass}>
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

      <CorruptionWidget penalties={player.penalties} />

      <div className="nozomi-embedded rounded-xl p-4">
        <SynchronizationStatus synchronization={player.synchronization} />
        {nextMilestone && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Next discipline cache at {nextMilestone.days}d sync — maintain chain.
          </p>
        )}
      </div>

      {readiness && <ReadinessSummary readiness={readiness} />}
      {forecast && <NextGateForecast forecast={forecast} />}

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
