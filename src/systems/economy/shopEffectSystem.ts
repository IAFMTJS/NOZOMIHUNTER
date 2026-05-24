import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { buildQuestRewards } from "@/systems/quests/questRewardFactory"
import { estimatedDungeonTimeLimitMinutes } from "@/systems/presentation/questPresentationSystem"
import { combinedTimerMultiplier } from "@/systems/dungeons/dungeonModifierSystem"
import {
  hasActiveBoost,
  rewardAmplifierMultiplier,
  xpGainMultiplier,
} from "@/systems/economy/boostSystem"
import { fatigueXpMultiplier } from "@/systems/penalties/penaltySystem"
import {
  peakEncounterStreak,
  xpMultiplierFromStreak,
} from "@/systems/learning/encounterPressureSystem"

/** Hard-tier reward uplift when playing on easy difficulty (System Breach). */
export const DIFFICULTY_OVERRIDE_REWARD_MULT = 1.4

export const TIME_FREEZE_MS = 30_000

export function isBossEncounter(quest: QuestContract): boolean {
  const run = quest.dungeonRun
  if (!run) return false
  return run.machineState === "BOSS" || run.activeType === "BOSS"
}

export function difficultyOverrideApplies(
  player: PlayerContract,
  quest: QuestContract
): boolean {
  if (!hasActiveBoost(player, "DIFFICULTY_OVERRIDE")) return false
  if (isBossEncounter(quest)) return false
  if (quest.type === "DUNGEON" && quest.dungeonRun?.machineState === "BOSS") {
    return false
  }
  return quest.difficulty === "EASY" || quest.difficulty === "NORMAL"
}

export function difficultyOverrideRewardMultiplier(
  player: PlayerContract,
  quest: QuestContract
): number {
  return difficultyOverrideApplies(player, quest)
    ? DIFFICULTY_OVERRIDE_REWARD_MULT
    : 1
}

export function boostedQuestRewards(
  player: PlayerContract,
  quest: QuestContract
): QuestContract["rewards"] {
  if (!difficultyOverrideApplies(player, quest)) {
    return quest.rewards
  }
  const hardTier = buildQuestRewards(player.level, quest.narrativeTier ?? "SIDE")
  const mult = DIFFICULTY_OVERRIDE_REWARD_MULT
  return {
    ...quest.rewards,
    xp: Math.max(quest.rewards.xp, Math.floor(hardTier.xp * mult)),
    credits: Math.max(
      quest.rewards.credits ?? 0,
      Math.floor((hardTier.credits ?? 0) * mult)
    ),
  }
}

export function initDungeonTimer(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun
  if (!run) return quest

  const minutes = estimatedDungeonTimeLimitMinutes(run.dungeon.encounters.length)
  const mult = combinedTimerMultiplier(run.modifiers)
  return {
    ...quest,
    dungeonRun: {
      ...run,
      runStartedAt: new Date().toISOString(),
      timeLimitMs: Math.floor(minutes * 60_000 * mult),
      frozenTimeMs: 0,
      frozenUntil: null,
    },
  }
}

export function applyTimeFreeze(run: DungeonRunContract): DungeonRunContract {
  const now = Date.now()
  const frozenUntilMs =
    Math.max(run.frozenUntil ? new Date(run.frozenUntil).getTime() : now, now) +
    TIME_FREEZE_MS

  return {
    ...run,
    frozenUntil: new Date(frozenUntilMs).toISOString(),
    frozenTimeMs: (run.frozenTimeMs ?? 0) + TIME_FREEZE_MS,
  }
}

export function isDungeonTimedOut(run: DungeonRunContract, now = Date.now()): boolean {
  if (!run.runStartedAt || !run.timeLimitMs) return false
  if (run.frozenUntil && now < new Date(run.frozenUntil).getTime()) {
    return false
  }
  const started = new Date(run.runStartedAt).getTime()
  const frozen = run.frozenTimeMs ?? 0
  return now > started + run.timeLimitMs + frozen
}

export function rankShieldBlocksXpDebt(player: PlayerContract): boolean {
  return hasActiveBoost(player, "RANK_SHIELD")
}

/** UI preview only — server grants via complete_quest_guarded. */
export function previewCompletionRewards(
  player: PlayerContract,
  quest: QuestContract,
  fatigue = player.penalties.fatigue
): { xp: number; credits: number } {
  const base = boostedQuestRewards(player, quest)
  const fatMult = fatigueXpMultiplier(fatigue)
  const streakMult = xpMultiplierFromStreak(peakEncounterStreak(quest))
  return {
    xp: Math.floor(
      base.xp *
        fatMult *
        streakMult *
        xpGainMultiplier(player) *
        rewardAmplifierMultiplier(player)
    ),
    credits: Math.floor(
      (base.credits ?? 0) * fatMult * rewardAmplifierMultiplier(player)
    ),
  }
}

export function dungeonTimeRemaining(
  run: DungeonRunContract,
  now = Date.now()
): number | null {
  if (!run.runStartedAt || !run.timeLimitMs) return null
  const started = new Date(run.runStartedAt).getTime()
  const frozen = run.frozenTimeMs ?? 0
  const deadline = started + run.timeLimitMs + frozen
  if (run.frozenUntil && now < new Date(run.frozenUntil).getTime()) {
    return Math.max(0, deadline - new Date(run.frozenUntil).getTime())
  }
  return Math.max(0, deadline - now)
}

export function formatDungeonTimeRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}
