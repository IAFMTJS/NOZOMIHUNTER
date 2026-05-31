import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { getNextDungeonForecast } from "@/systems/dungeons/dungeonForecastSystem"
import { activeBoostsForPlayer } from "@/systems/economy/boostSystem"
import { listAvailableDungeons } from "@/config/dungeonConfig"
import { FEATURE_FLAGS } from "@/config/features"
import { getActiveSectorEvent } from "@/config/eventScheduleConfig"
import { resolveLiveRewardModifiers } from "@/systems/live/liveEventModifierSystem"
import {
  getActiveLanguageInvasion,
  invasionCorruptionDrift,
} from "@/systems/retention/languageInvasionSystem"
import { buildContractCatalog } from "@/systems/quests/contractCatalogSystem"
import {
  dailyMilestoneProgress,
  DAILY_MILESTONE_TARGET,
  dailyChainRemainingLabel,
} from "@/systems/quests/dailyMilestoneSystem"
import { getNextStoryMission } from "@/systems/content/seasonContentLoader"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"
import { resolveNarrativePhase } from "@/config/seasonConfig"

export interface OperationalAlert {
  id: string
  tone: "danger" | "warning" | "accent"
  headline: string
  detail: string
  recoveryHref?: string
}

export interface ContractRotationItem {
  id: string
  title: string
  channel: string
  difficulty: string
}

export interface InstabilityFeedItem {
  id: string
  label: string
  value: string
  severity: "low" | "medium" | "high"
}

export interface SectorActivityItem {
  id: string
  label: string
  status: string
}

export interface AnomalyFeedItem {
  id: string
  label: string
  detail: string
  recoveryHref?: string
}

export interface OperationalFeedSnapshot {
  alerts: OperationalAlert[]
  contractRotation: ContractRotationItem[]
  instability: InstabilityFeedItem[]
  sectorActivity: SectorActivityItem[]
  anomalies: AnomalyFeedItem[]
  activeBoostCount: number
  storyAlerts: OperationalAlert[]
}

export function buildOperationalFeed(
  player: PlayerContract,
  activeQuests: QuestContract[],
  seed: string
): OperationalFeedSnapshot {
  const readiness = computeReadiness({ player })
  const forecast = getNextDungeonForecast(player, activeQuests)
  const catalog = buildContractCatalog(activeQuests)
  const boosts = activeBoostsForPlayer(player)
  const alerts: OperationalAlert[] = []
  const storyAlerts: OperationalAlert[] = []
  const instability: InstabilityFeedItem[] = []
  const anomalies: AnomalyFeedItem[] = []

  const storyProgress = resolveStoryProgress(player)
  const nextStory = getNextStoryMission(player)
  const narrativePhase = resolveNarrativePhase(storyProgress.completedBeatIds.length)

  if (nextStory) {
    storyAlerts.push({
      id: "story-next-beat",
      tone: "accent",
      headline: `Act ${narrativePhase.title} — ${nextStory.title}`,
      detail: `${nextStory.titleJa} · Beat ${nextStory.missionIndex}/24 awaiting deployment.`,
      recoveryHref: `/contracts`,
    })
  }

  if (storyProgress.irisTrustTier === "COOPERATIVE") {
    storyAlerts.push({
      id: "iris-whisper-tier",
      tone: "accent",
      headline: "Iris trust: cooperative",
      detail: "Japanese mission copy unlocked — whispers may appear on home.",
      recoveryHref: "/contacts",
    })
  }

  if (player.synchronization.atRisk) {
    alerts.push({
      id: "sync-risk",
      tone: "warning",
      headline: "Discipline chain at risk",
      detail: "Deploy today to maintain synchronization.",
    })
  }

  const milestone = dailyMilestoneProgress(activeQuests, player.id)
  if (milestone.completed > 0 && milestone.completed < DAILY_MILESTONE_TARGET) {
    alerts.push({
      id: "daily-milestone",
      tone: "accent",
      headline: "Daily contract chain",
      detail: dailyChainRemainingLabel(milestone.completed),
      recoveryHref: "/contracts",
    })
  }

  if (player.progression.discipline >= 5) {
    alerts.push({
      id: "discipline-cache",
      tone: "accent",
      headline: "Discipline cache available",
      detail: `${player.progression.discipline} discipline — research relic nodes in inventory.`,
      recoveryHref: "/inventory",
    })
  }

  if (player.penalties.corruption >= 50) {
    alerts.push({
      id: "corruption-high",
      tone: "danger",
      headline: "Corruption threshold exceeded",
      detail: "Signal degradation active across sectors.",
    })
  }

  if (readiness.survivalBand === "CRITICAL" || readiness.survivalBand === "UNSTABLE") {
    alerts.push({
      id: "readiness-low",
      tone: "warning",
      headline: "Readiness unstable",
      detail: `Preparation ${readiness.preparationScore}% — use training or vocabulary to recover.`,
      recoveryHref: "/training",
    })
  }

  instability.push({
    id: "corruption",
    label: "Corruption index",
    value: `${player.penalties.corruption}%`,
    severity: player.penalties.corruption >= 50 ? "high" : player.penalties.corruption >= 25 ? "medium" : "low",
  })

  instability.push({
    id: "fatigue",
    label: "Operator fatigue",
    value: `${player.penalties.fatigue}%`,
    severity: player.penalties.fatigue >= 65 ? "high" : player.penalties.fatigue >= 40 ? "medium" : "low",
  })

  instability.push({
    id: "readiness",
    label: "Readiness",
    value: `${readiness.preparationScore}%`,
    severity:
      readiness.survivalBand === "CRITICAL"
        ? "high"
        : readiness.survivalBand === "UNSTABLE"
          ? "medium"
          : "low",
  })

  const invasion = getActiveLanguageInvasion(seed)
  if (invasion) {
    const drift = invasionCorruptionDrift(invasion)
    anomalies.push({
      id: invasion.id,
      label: invasion.headline,
      detail: `${invasion.detail}${drift > 0 ? ` · Corruption drift +${drift}%` : ""}`,
      recoveryHref: "/contracts?channel=anomaly",
    })
    instability.push({
      id: "invasion-drift",
      label: "Language invasion drift",
      value: drift > 0 ? `+${drift}%` : "—",
      severity: drift >= 3 ? "high" : drift >= 1 ? "medium" : "low",
    })
  }

  if (FEATURE_FLAGS.LIVE_SECTOR_EVENTS) {
    const event = getActiveSectorEvent(seed)
    const liveMods = resolveLiveRewardModifiers(seed)
    if (event) {
      const bonus =
        liveMods.xpMultiplier > 1
          ? ` XP ×${liveMods.xpMultiplier.toFixed(2)}`
          : ""
      anomalies.push({
        id: event.id,
        label: event.title,
        detail: `${event.description}${bonus}`,
        recoveryHref: "/contracts",
      })
    }
  }

  const unlocked = listAvailableDungeons(
    player.level,
    player.progression.unlockedDungeons
  )
  const sectorActivity: SectorActivityItem[] = unlocked.slice(0, 4).map((d) => ({
    id: d.key,
    label: d.name,
    status: "online",
  }))

  if (forecast && !forecast.isReady) {
    sectorActivity.unshift({
      id: "next-gate",
      label: forecast.dungeon.name,
      status: forecast.access.status.replace(/_/g, " "),
    })
  }

  const contractRotation: ContractRotationItem[] = [
    ...catalog.dailyQuests.slice(0, 2).map((q) => ({
      id: q.id,
      title: q.title,
      channel: "daily",
      difficulty: q.difficulty,
    })),
    ...catalog.sideQuests.slice(0, 2).map((q) => ({
      id: q.id,
      title: q.title,
      channel: "side",
      difficulty: q.difficulty,
    })),
  ]

  return {
    alerts,
    storyAlerts,
    contractRotation,
    instability,
    sectorActivity,
    anomalies,
    activeBoostCount: boosts.length,
  }
}
