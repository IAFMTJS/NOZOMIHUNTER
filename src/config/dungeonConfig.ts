import type { DungeonTheme } from "@/contracts/dungeon-contract"
import type { EncounterType } from "@/contracts/dungeon-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import type { QuestPenaltyContract } from "@/contracts/quest-contract"

export interface DungeonDefinitionConfig {
  key: string
  theme: DungeonTheme
  name: string
  description: string
  minLevel: number
  staminaCost: number
  recommendedPower: number
  /** Gameplay mode routed through dungeon run state. */
  dungeonMode?: GameModeId
  /** Must appear in player.progression.unlockedDungeons before entry. */
  requiredDungeon?: string
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
    staminaCost: 20,
    recommendedPower: 1040,
    encounterPlan: [
      { id: "sector-vocab", type: "VOCAB", difficulty: 1 },
      { id: "sector-listen", type: "LISTENING", difficulty: 2 },
      { id: "sector-npc", type: "NPC", difficulty: 2 },
      { id: "sector-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "Corridor Warden",
    rewardXpBase: 120,
    unlocks: [
      "dungeon:neon-corridor",
      "dungeon:shadow-archive",
      "system:dungeons",
    ],
  },
  {
    key: "dungeon:shadow-archive",
    theme: "SHADOW_ARCHIVE",
    name: "Shadow Archive",
    description:
      "Cold storage beneath the grid. Listening ghosts, sealed dialogue, and the Archive Warden.",
    minLevel: 4,
    staminaCost: 25,
    recommendedPower: 1520,
    requiredDungeon: "dungeon:neon-corridor",
    encounterPlan: [
      { id: "sector-listen", type: "LISTENING", difficulty: 2 },
      { id: "sector-vocab", type: "VOCAB", difficulty: 2 },
      { id: "sector-npc", type: "NPC", difficulty: 3 },
      { id: "sector-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "Archive Warden",
    rewardXpBase: 150,
    unlocks: ["dungeon:shadow-archive"],
  },
  {
    key: "dungeon:abyss-core",
    theme: "ABYSS_CORE",
    name: "Abyss Core",
    description:
      "The deepest breach point. Extreme signal density, warden-class entities, and zero margin for decode failure.",
    minLevel: 8,
    staminaCost: 35,
    recommendedPower: 2400,
    requiredDungeon: "dungeon:shadow-archive",
    encounterPlan: [
      { id: "sector-vocab", type: "VOCAB", difficulty: 3 },
      { id: "sector-listen", type: "LISTENING", difficulty: 4 },
      { id: "sector-npc", type: "NPC", difficulty: 4 },
      { id: "sector-speech", type: "SPEECH", difficulty: 4 },
    ],
    bossName: "Core Warden",
    rewardXpBase: 200,
    unlocks: ["dungeon:abyss-core"],
  },
  {
    key: "dungeon:corruption-run",
    theme: "NEON_CITY",
    dungeonMode: "CORRUPTION_RUN",
    name: "Corruption Run",
    description:
      "Endless sector loop. Corruption spikes with every mistake — survive the collapse or extract.",
    minLevel: 5,
    staminaCost: 22,
    recommendedPower: 1280,
    requiredDungeon: "dungeon:neon-corridor",
    encounterPlan: [
      { id: "run-vocab", type: "VOCAB", difficulty: 2 },
      { id: "run-listen", type: "LISTENING", difficulty: 2 },
      { id: "run-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "Collapse Echo",
    rewardXpBase: 140,
    unlocks: ["dungeon:corruption-run"],
  },
  {
    key: "dungeon:void-pursuit",
    theme: "ABANDONED_STATION",
    dungeonMode: "VOID_PURSUIT",
    name: "Void Pursuit",
    description:
      "Something hunts you through dead relays. Decode fast — distance is survival.",
    minLevel: 6,
    staminaCost: 24,
    recommendedPower: 1480,
    requiredDungeon: "dungeon:corruption-run",
    encounterPlan: [
      { id: "pursuit-listen", type: "LISTENING", difficulty: 3 },
      { id: "pursuit-vocab", type: "VOCAB", difficulty: 3 },
      { id: "pursuit-npc", type: "NPC", difficulty: 3 },
    ],
    bossName: "Void Stalker",
    rewardXpBase: 155,
    unlocks: ["dungeon:void-pursuit"],
  },
  {
    key: "dungeon:roguelike-sector",
    theme: "CORRUPTED_SHRINE",
    dungeonMode: "ROGUELIKE_SECTOR",
    name: "Roguelike Sector",
    description:
      "Procedural modifiers mutate each run. Choose instability — or be chosen.",
    minLevel: 7,
    staminaCost: 28,
    recommendedPower: 1680,
    requiredDungeon: "dungeon:void-pursuit",
    encounterPlan: [
      { id: "rogue-vocab", type: "VOCAB", difficulty: 3 },
      { id: "rogue-listen", type: "LISTENING", difficulty: 3 },
      { id: "rogue-speech", type: "SPEECH", difficulty: 4 },
      { id: "rogue-npc", type: "NPC", difficulty: 4 },
    ],
    bossName: "Shrine Warden",
    rewardXpBase: 175,
    unlocks: ["dungeon:roguelike-sector"],
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
      playerLevel >= d.minLevel && unlockedDungeons.includes(d.key)
  )
}
