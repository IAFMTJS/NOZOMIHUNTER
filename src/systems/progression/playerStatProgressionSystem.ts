import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"

const STAT_CAP = 100

export type PlayerSkillStats = PlayerContract["stats"]

function clampStat(value: number): number {
  return Math.min(STAT_CAP, Math.max(0, value))
}

export function statDeltasForQuest(quest: QuestContract): Partial<PlayerSkillStats> {
  const daily = quest.narrativeTier === "DAILY"
  const scale = daily ? 1 : 2

  switch (quest.type) {
    case "VOCABULARY":
      return { vocabulary: scale, consistency: 1 }
    case "LISTENING":
      return { listening: scale, confidence: 1 }
    case "SPEECH":
      return { speaking: scale, confidence: 1 }
    case "CONVERSATION":
      return { grammar: scale, intelligence: 1 }
    case "DUNGEON":
      return { vocabulary: 1, listening: 1, consistency: 1 }
    default:
      return { consistency: 1 }
  }
}

export function applyStatDeltas(
  stats: PlayerSkillStats,
  deltas: Partial<PlayerSkillStats>
): PlayerSkillStats {
  const next = { ...stats }
  for (const key of Object.keys(deltas) as (keyof PlayerSkillStats)[]) {
    const delta = deltas[key]
    if (delta == null) continue
    next[key] = clampStat((next[key] ?? 0) + delta)
  }
  return next
}

export function applyQuestStatRewards(
  player: PlayerContract,
  quest: QuestContract
): PlayerContract {
  const deltas = statDeltasForQuest(quest)
  return {
    ...player,
    stats: applyStatDeltas(player.stats, deltas),
  }
}
