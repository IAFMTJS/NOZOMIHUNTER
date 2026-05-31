import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"

export type EncounterScaleContext =
  | "dungeon-sector"
  | "dungeon-boss"
  | "dungeon-elite"
  | "story"
  | "quest"
  | "daily"
  | "listening"
  | "extraction"

export interface ResolveWordCountInput {
  context: EncounterScaleContext
  playerLevel: number
  explicit?: number
  danger?: "low" | "medium" | "high"
}

function tierBand(level: number): 0 | 1 | 2 | 3 {
  if (level >= 31) return 3
  if (level >= 16) return 2
  if (level >= 6) return 1
  return 0
}

const SECTOR_VOCAB_BY_TIER = [3, 4, 6, 8] as const
const BOSS_VOCAB_BY_TIER = [2, 3, 4, 6] as const
const STORY_VOCAB_BY_TIER = [3, 4, 5, 7] as const
const QUEST_VOCAB_BY_TIER = [5, 5, 6, 8] as const
const DAILY_VOCAB_BY_TIER = [2, 3, 3, 4] as const
const LISTENING_BY_TIER = [2, 3, 4, 5] as const

export function resolveWordCount(input: ResolveWordCountInput): number {
  if (input.explicit != null && input.explicit > 0) return input.explicit
  const tier = tierBand(input.playerLevel)
  let base: number
  switch (input.context) {
    case "dungeon-sector":
      base = SECTOR_VOCAB_BY_TIER[tier]
      break
    case "dungeon-boss":
      base = BOSS_VOCAB_BY_TIER[tier]
      break
    case "dungeon-elite":
      base = SECTOR_VOCAB_BY_TIER[tier] + 2
      break
    case "story":
      base = STORY_VOCAB_BY_TIER[tier]
      break
    case "daily":
      base = DAILY_VOCAB_BY_TIER[tier]
      break
    case "extraction":
      base = 2
      break
    case "listening":
      base = LISTENING_BY_TIER[tier]
      break
    default:
      base = QUEST_VOCAB_BY_TIER[tier]
  }
  if (input.danger === "high") base += 1
  return base
}

export function resolveListeningFragmentCount(
  playerLevel: number,
  explicit?: number
): number {
  return resolveWordCount({
    context: "listening",
    playerLevel,
    explicit,
  })
}

export function resolveSessionInteractionBudget(playerLevel: number): number {
  const tier = tierBand(playerLevel)
  const budgets = [25, 40, 60, 90] as const
  return budgets[tier]
}

export function resolveDungeonTimeLimitMinutes(
  routeNodeCount: number,
  bossPhaseCount: number
): number {
  return Math.max(8, routeNodeCount * 4 + bossPhaseCount * 3 + 2)
}

/** @deprecated use resolveWordCount — kept for dungeon config compatibility */
export function legacySectorWordCount(playerLevel: number): number {
  return resolveWordCount({ context: "dungeon-sector", playerLevel })
}

export function legacyBossWordCount(playerLevel: number): number {
  return resolveWordCount({ context: "dungeon-boss", playerLevel })
}

export { DUNGEON_CONFIG, VOCABULARY_ENCOUNTER_CONFIG, LISTENING_QUEST_CONFIG }
