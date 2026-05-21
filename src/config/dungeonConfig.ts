import type { DungeonTheme } from "@/contracts/dungeon-contract"
import type { EncounterType } from "@/contracts/dungeon-contract"
import type { QuestPenaltyContract } from "@/contracts/quest-contract"

export interface DungeonDefinitionConfig {
  key: string
  theme: DungeonTheme
  name: string
  description: string
  minLevel: number
  encounterPlan: { id: string; type: EncounterType; difficulty: number }[]
  bossName: string
  rewardXpBase: number
  unlocks: string[]
}

export const DUNGEON_CONFIG = {
  MAX_ENCOUNTER_FAILURES: 2,
  DUNGEON_FAILURE_PENALTIES: {
    corruption: 3,
    fatigue: 4,
    xpDebt: 15,
  } satisfies QuestPenaltyContract,
  LISTENING_FRAGMENT_COUNT: 2,
  SECTOR_VOCAB_WORDS: 3,
  BOSS_VOCAB_WORDS: 2,
  BOSS_SPEECH_SCENARIO: "gate-check",
} as const

export const DUNGEON_DEFINITIONS: DungeonDefinitionConfig[] = [
  {
    key: "dungeon:neon-corridor",
    theme: "CYBER_TOKYO",
    name: "Neon Corridor",
    description:
      "A unstable sector of the network. Decode signals, hold dialogue under pressure, and breach the core.",
    minLevel: 2,
    encounterPlan: [
      { id: "sector-vocab", type: "VOCAB", difficulty: 1 },
      { id: "sector-listen", type: "LISTENING", difficulty: 2 },
      { id: "sector-npc", type: "NPC", difficulty: 2 },
      { id: "sector-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "Corridor Warden",
    rewardXpBase: 120,
    unlocks: ["dungeon:neon-corridor", "system:dungeons"],
  },
]

export function getDungeonDefinition(key: string): DungeonDefinitionConfig {
  const def = DUNGEON_DEFINITIONS.find((d) => d.key === key)
  if (!def) {
    throw new Error(`Unknown dungeon: ${key}`)
  }
  return def
}

export function listAvailableDungeons(
  playerLevel: number,
  unlockedDungeons: string[]
): DungeonDefinitionConfig[] {
  return DUNGEON_DEFINITIONS.filter(
    (d) =>
      playerLevel >= d.minLevel &&
      (unlockedDungeons.includes(d.key) || d.key === "dungeon:neon-corridor")
  )
}
