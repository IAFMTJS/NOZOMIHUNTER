import { ALMOST_THERE_CONFIG } from "@/config/almostThereConfig"
import { PROGRESSION_CONFIG } from "@/config/progressionConfig"
import type {
  AlmostThereObjectiveContract,
  HunterRank,
  PlayerContract,
} from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { rankFromLevel } from "@/systems/progression/rankSystem"
import { getTrackedQuest } from "@/systems/quests/contractTrackingSystem"
import { getNextStoryMission } from "@/systems/content/seasonContentLoader"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"
import {
  dailyMilestoneProgress,
  DAILY_MILESTONE_TARGET,
} from "@/systems/quests/dailyMilestoneSystem"

const RANK_ORDER: HunterRank[] = ["E", "D", "C", "B", "A", "S", "SS", "SSS"]

export function nextRankAfter(current: HunterRank): HunterRank | null {
  const i = RANK_ORDER.indexOf(current)
  if (i < 0 || i >= RANK_ORDER.length - 1) return null
  return RANK_ORDER[i + 1] ?? null
}

export function rankProgressPercent(level: number, rank: HunterRank): number {
  const next = nextRankAfter(rank)
  if (!next) return 100
  const currentThreshold =
    PROGRESSION_CONFIG.RANK_THRESHOLDS[
      rank as keyof typeof PROGRESSION_CONFIG.RANK_THRESHOLDS
    ]
  const nextThreshold =
    PROGRESSION_CONFIG.RANK_THRESHOLDS[
      next as keyof typeof PROGRESSION_CONFIG.RANK_THRESHOLDS
    ]
  const span = Math.max(1, nextThreshold - currentThreshold)
  const progress = Math.max(0, level - currentThreshold)
  return Math.min(100, Math.round((progress / span) * 100))
}

export interface ProximityChipContract {
  id: string
  label: string
  value: string
  subline: string
  tone: "accent" | "danger" | "reward" | "muted"
}

export function buildAlmostThereObjective(
  player: PlayerContract,
  activeQuests: QuestContract[]
): AlmostThereObjectiveContract {
  const nextStory = getNextStoryMission(player)
  const storyProgress = resolveStoryProgress(player)
  const dailyMilestone = dailyMilestoneProgress(activeQuests, player.id)

  if (
    nextStory &&
    storyProgress.completedBeatIds.length < 24 &&
    dailyMilestone.completed < DAILY_MILESTONE_TARGET
  ) {
    const tracked = getTrackedQuest(activeQuests, player)
    return {
      title: nextStory.title,
      progressPercent: Math.round(
        (storyProgress.completedBeatIds.length / 24) * 100
      ),
      detailLine: `Story beat ${nextStory.missionIndex}/24 — ${nextStory.titleJa}`,
      contractsRemaining: null,
      ctaHref: tracked?.narrativeTier === "MAIN"
        ? `/contracts/${tracked.id}`
        : `/contracts`,
      ctaLabel: "Open story file",
    }
  }

  if (dailyMilestone.completed > 0 && dailyMilestone.completed < DAILY_MILESTONE_TARGET) {
    return {
      title: "Daily contract chain",
      progressPercent: Math.round(
        (dailyMilestone.completed / DAILY_MILESTONE_TARGET) * 100
      ),
      detailLine: `${dailyMilestone.completed}/${DAILY_MILESTONE_TARGET} clears — bonus at third extraction`,
      contractsRemaining: DAILY_MILESTONE_TARGET - dailyMilestone.completed,
      ctaHref: "/contracts",
      ctaLabel: "Continue daily chain",
    }
  }

  const next = nextRankAfter(player.rank)
  const rankPct = rankProgressPercent(player.level, player.rank)
  const tracked = getTrackedQuest(activeQuests, player)
  const xpSlice = xpProgressInCurrentLevel(player.xp, player.level)

  if (next && player.level >= ALMOST_THERE_CONFIG.MIN_LEVEL_FOR_RANK_OBJECTIVE) {
    return {
      title: `Reach Rank ${next}`,
      progressPercent: rankPct,
      detailLine: `${ALMOST_THERE_CONFIG.CONTRACTS_FOR_RANK_HINT} contracts until promotion window`,
      contractsRemaining: ALMOST_THERE_CONFIG.CONTRACTS_FOR_RANK_HINT,
      ctaHref: tracked ? `/contracts/${tracked.id}` : "/contracts",
      ctaLabel: tracked ? "Continue hunt" : "Open contracts",
    }
  }

  const xpRemaining = Math.max(0, xpSlice.required - xpSlice.current)
  return {
    title: `Level ${player.level + 1} breach`,
    progressPercent: Math.round((xpSlice.current / Math.max(1, xpSlice.required)) * 100),
    detailLine: `${xpRemaining} XP remaining`,
    contractsRemaining: null,
    ctaHref: tracked ? `/prepare?questId=${encodeURIComponent(tracked.id)}` : "/training",
    ctaLabel: tracked ? "Deploy tracked file" : "Stabilization drill",
  }
}

export function buildProximityChips(
  player: PlayerContract,
  sectorCorruptionPercent: number,
  sectorBreachDelta: number,
  activeQuests: QuestContract[] = []
): ProximityChipContract[] {
  const next = nextRankAfter(player.rank)
  const rankPct = rankProgressPercent(player.level, player.rank)
  const syncTarget = 7
  const syncRemaining = Math.max(0, syncTarget - player.synchronization.chainDays)
  const storyProgress = resolveStoryProgress(player)
  const nextStory = getNextStoryMission(player)
  const dailyMilestone = dailyMilestoneProgress(activeQuests, player.id)

  const chips: ProximityChipContract[] = [
    {
      id: "rank",
      label: "Rank progress",
      value: next ? `${rankPct}%` : "MAX",
      subline: next
        ? `${ALMOST_THERE_CONFIG.CONTRACTS_FOR_RANK_HINT} contracts until Rank ${next}`
        : "Peak registry tier",
      tone: "accent",
    },
    {
      id: "sector",
      label: "Sector corruption",
      value: `${sectorCorruptionPercent}%`,
      subline:
        sectorBreachDelta > 0
          ? `${sectorBreachDelta}% until breach advisory`
          : "Corridor stable",
      tone: sectorCorruptionPercent >= 50 ? "danger" : "muted",
    },
    {
      id: "sync",
      label: "Daily sync",
      value: `${player.synchronization.chainDays}d`,
      subline:
        syncRemaining > 0
          ? `${syncRemaining} days until relic cache`
          : "Discipline cache ready",
      tone: "reward",
    },
    {
      id: "xp",
      label: "Next level",
      value: `${xpProgressInCurrentLevel(player.xp, player.level).current}`,
      subline: `/${xpProgressInCurrentLevel(player.xp, player.level).required} XP`,
      tone: "muted",
    },
  ]

  if (nextStory) {
    chips.unshift({
      id: "story",
      label: "Story arc",
      value: `${storyProgress.completedBeatIds.length}/24`,
      subline: nextStory.title,
      tone: "accent",
    })
  }

  if (dailyMilestone.completed > 0 && dailyMilestone.completed < DAILY_MILESTONE_TARGET) {
    chips.push({
      id: "daily-chain",
      label: "Daily chain",
      value: `${dailyMilestone.completed}/${DAILY_MILESTONE_TARGET}`,
      subline: dailyMilestone.bonusReady
        ? "Bonus unlocked"
        : "Clear for extraction bonus",
      tone: "reward",
    })
  }

  return chips
}

export function hunterPowerPercentileLabel(totalPower: number): string {
  if (totalPower >= 2500) return "Top 12% of hunters"
  if (totalPower >= 2000) return "Top 32% of hunters"
  if (totalPower >= 1500) return "Top 48% of hunters"
  if (totalPower >= 1000) return "Top 64% of hunters"
  return "Rising operator"
}
