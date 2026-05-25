import type { GateClearedStats } from "@/systems/presentation/ceremonies/ceremonyTypes"
import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  buildGateClearedStats,
  gradeFromAccuracy,
  rewardsFromPendingBundle,
} from "@/systems/presentation/gateClearedPresentation"
import { peakEncounterStreak, xpMultiplierFromStreak } from "@/systems/learning/encounterPressureSystem"
import type { ExtractionMasteryEntry } from "@/systems/dungeons/dungeonLexiconRecapSystem"
import type { DungeonClearCeremonyViewModel } from "./ceremonyTypes"

export function performanceLabelFromStats(
  stats: GateClearedStats,
  encounterFailures: number
): string {
  if (encounterFailures === 0 && stats.grade === "S") return "PERFECT CLEAR"
  if (stats.grade === "S") return "RANK: S"
  if (stats.grade === "A") return "RANK: A"
  return `RANK: ${stats.grade}`
}

export function buildDungeonClearFromRun(
  quest: QuestContract,
  bundle: PendingRewardBundleContract,
  player: PlayerContract,
  options?: {
    accuracyPercent?: number
    timeSeconds?: number
    masteryRecap?: ExtractionMasteryEntry[]
  }
): DungeonClearCeremonyViewModel {
  const run = quest.dungeonRun
  const failures = run?.encounterFailures ?? 0
  const accuracy =
    options?.accuracyPercent ??
    Math.max(55, 100 - failures * 12 - Math.min(20, player.penalties.corruption))
  const stats = buildGateClearedStats(bundle, {
    accuracyPercent: accuracy,
    timeSeconds: options?.timeSeconds,
  })
  const streak = peakEncounterStreak(quest)
  const mult = xpMultiplierFromStreak(streak)

  const aftermath: string[] = []
  if (player.penalties.corruption > 0) {
    aftermath.push(`Corruption residue: ${player.penalties.corruption}`)
  } else {
    aftermath.push("Corruption reduced in sector")
  }
  aftermath.push(`Registry level ${player.level} — XP synced`)
  if (streak >= 3) {
    aftermath.push(`Peak channel streak: ${streak}`)
  }

  return {
    dungeonName: run?.dungeon.name ?? quest.title,
    grade: stats.grade,
    performanceLabel: performanceLabelFromStats(stats, failures),
    rewards: rewardsFromPendingBundle(bundle),
    xpGained: bundle.xpGained,
    streakMultiplier: mult > 1 ? mult : undefined,
    masteryRecap: options?.masteryRecap?.map((e) => ({
      label: e.label,
      mastery: e.mastery,
    })),
    aftermathLines: aftermath,
  }
}

export { gradeFromAccuracy }
