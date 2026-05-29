import type {
  DungeonBossPhaseSpec,
  DungeonRouteGraph,
  DungeonTheme,
  EncounterType,
} from "@/contracts/dungeon-contract"
import type { DungeonMasterId } from "@/contracts/dungeon-master-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import type { QuestPenaltyContract } from "@/contracts/quest-contract"
import {
  NEON_CORRIDOR_BOSS_PHASES,
  NEON_CORRIDOR_ROUTE_GRAPH,
} from "@/config/neonCorridorV2Config"
import {
  ARCHIVIST_BOSS_PHASES,
  SHADOW_ARCHIVE_ROUTE_GRAPH,
} from "@/config/shadowArchiveV2Config"
import { DUNGEON_V2_OVERLAY } from "@/config/dungeonV2OverlayConfig"

export interface DungeonDefinitionConfig {
  key: string
  theme: DungeonTheme
  name: string
  description: string
  minLevel: number
  staminaCost: number
  recommendedPower: number
  masterId: DungeonMasterId
  /** Gameplay mode routed through dungeon run state. */
  dungeonMode?: GameModeId
  /** Must appear in player.progression.unlockedDungeons before entry. */
  requiredDungeon?: string
  encounterPlan: { id: string; type: EncounterType; difficulty: number }[]
  bossName: string
  /** Key for content_boss_phases DB lookup (defaults to `key`). */
  bossKey?: string
  rewardXpBase: number
  unlocks: string[]
  /** 2 = branching route / threat / combat actions. */
  runSchemaVersion?: 1 | 2
  routeGraph?: DungeonRouteGraph
  bossPhaseSpecs?: DungeonBossPhaseSpec[]
}

export const DUNGEON_CONFIG = {
  /** Presentation-only recovery route node (V2 route graphs may reference RECOVERY). */
  RECOVERY_ROUTE: {
    nodeType: "RECOVERY" as const,
    label: "Recovery alcove",
    corruptionReliefCopy: "Brief stabilization — sector pressure eases before the next breach.",
  },
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
    masterId: "neon-warden",
    theme: "CYBER_TOKYO",
    name: "Neon Corridor",
    description:
      "An unstable sector of the network. Decode signals, hold dialogue under pressure, and breach the core.",
    minLevel: 2,
    staminaCost: 20,
    recommendedPower: 1040,
    runSchemaVersion: 2,
    routeGraph: NEON_CORRIDOR_ROUTE_GRAPH,
    bossPhaseSpecs: NEON_CORRIDOR_BOSS_PHASES,
    encounterPlan: [
      { id: "sector-vocab", type: "VOCAB", difficulty: 1 },
      { id: "sector-listen", type: "LISTENING", difficulty: 2 },
      { id: "sector-npc", type: "NPC", difficulty: 2 },
      { id: "sector-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "Neon Warden",
    rewardXpBase: 120,
    unlocks: [
      "dungeon:neon-corridor",
      "dungeon:shadow-archive",
      "system:dungeons",
    ],
  },
  {
    key: "dungeon:shadow-archive",
    masterId: "archivist",
    theme: "SHADOW_ARCHIVE",
    name: "Shadow Archive",
    description:
      "Cold storage beneath the grid. Listening ghosts, sealed dialogue, and The Archivist.",
    minLevel: 4,
    staminaCost: 25,
    recommendedPower: 1520,
    requiredDungeon: "dungeon:neon-corridor",
    runSchemaVersion: 2,
    routeGraph: SHADOW_ARCHIVE_ROUTE_GRAPH,
    bossPhaseSpecs: ARCHIVIST_BOSS_PHASES,
    dungeonMode: "ARCHIVIST_BOSS",
    encounterPlan: [
      { id: "sector-listen", type: "LISTENING", difficulty: 2 },
      { id: "sector-vocab", type: "VOCAB", difficulty: 2 },
      { id: "sector-npc", type: "NPC", difficulty: 3 },
      { id: "sector-speech", type: "SPEECH", difficulty: 3 },
    ],
    bossName: "The Archivist",
    rewardXpBase: 150,
    unlocks: ["dungeon:shadow-archive"],
  },
  {
    key: "dungeon:abyss-core",
    masterId: "gate-devourer",
    theme: "ABYSS_CORE",
    name: "Abyss Core",
    description:
      "The deepest breach point. Extreme signal density, warden-class entities, and zero margin for decode failure.",
    minLevel: 8,
    staminaCost: 35,
    recommendedPower: 2400,
    requiredDungeon: "dungeon:shadow-archive",
    runSchemaVersion: 2,
    routeGraph: DUNGEON_V2_OVERLAY["dungeon:abyss-core"]!.routeGraph,
    bossPhaseSpecs: DUNGEON_V2_OVERLAY["dungeon:abyss-core"]!.bossPhaseSpecs,
    encounterPlan: [
      { id: "sector-vocab", type: "VOCAB", difficulty: 3 },
      { id: "sector-listen", type: "LISTENING", difficulty: 4 },
      { id: "sector-npc", type: "NPC", difficulty: 4 },
      { id: "sector-speech", type: "SPEECH", difficulty: 4 },
    ],
    bossName: "The Gate Devourer",
    rewardXpBase: 200,
    unlocks: ["dungeon:abyss-core"],
  },
  {
    key: "dungeon:corruption-run",
    masterId: "collapse-echo",
    theme: "NEON_CITY",
    dungeonMode: "CORRUPTION_RUN",
    name: "Corruption Run",
    description:
      "Endless sector loop. Corruption spikes with every mistake — survive the collapse or extract.",
    minLevel: 5,
    staminaCost: 22,
    recommendedPower: 1280,
    requiredDungeon: "dungeon:neon-corridor",
    runSchemaVersion: 2,
    routeGraph: DUNGEON_V2_OVERLAY["dungeon:corruption-run"]!.routeGraph,
    bossPhaseSpecs: DUNGEON_V2_OVERLAY["dungeon:corruption-run"]!.bossPhaseSpecs,
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
    masterId: "mirror-hunter",
    theme: "ABANDONED_STATION",
    dungeonMode: "VOID_PURSUIT",
    name: "Void Pursuit",
    description:
      "Something hunts you through dead relays. Decode fast — distance is survival.",
    minLevel: 6,
    staminaCost: 24,
    recommendedPower: 1480,
    requiredDungeon: "dungeon:corruption-run",
    runSchemaVersion: 2,
    routeGraph: DUNGEON_V2_OVERLAY["dungeon:void-pursuit"]!.routeGraph,
    bossPhaseSpecs: DUNGEON_V2_OVERLAY["dungeon:void-pursuit"]!.bossPhaseSpecs,
    encounterPlan: [
      { id: "pursuit-listen", type: "LISTENING", difficulty: 3 },
      { id: "pursuit-vocab", type: "VOCAB", difficulty: 3 },
      { id: "pursuit-npc", type: "NPC", difficulty: 3 },
    ],
    bossName: "The Mirror Hunter",
    rewardXpBase: 155,
    unlocks: ["dungeon:void-pursuit"],
  },
  {
    key: "dungeon:roguelike-sector",
    masterId: "shrine-warden",
    theme: "CORRUPTED_SHRINE",
    dungeonMode: "ROGUELIKE_SECTOR",
    name: "Roguelike Sector",
    description:
      "Procedural modifiers mutate each run. Choose instability — or be chosen.",
    minLevel: 7,
    staminaCost: 28,
    recommendedPower: 1680,
    requiredDungeon: "dungeon:void-pursuit",
    runSchemaVersion: 2,
    routeGraph: DUNGEON_V2_OVERLAY["dungeon:roguelike-sector"]!.routeGraph,
    bossPhaseSpecs: DUNGEON_V2_OVERLAY["dungeon:roguelike-sector"]!.bossPhaseSpecs,
    encounterPlan: [
      { id: "rogue-vocab", type: "VOCAB", difficulty: 3 },
      { id: "rogue-listen", type: "LISTENING", difficulty: 3 },
      { id: "rogue-speech", type: "SPEECH", difficulty: 4 },
      { id: "rogue-npc", type: "NPC", difficulty: 4 },
    ],
    bossName: "The Broadcast Spirit",
    rewardXpBase: 175,
    unlocks: ["dungeon:roguelike-sector"],
  },
]

/** Accept full keys (`dungeon:shadow-archive`) or URL slugs (`shadow-archive`). */
export function normalizeDungeonKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return trimmed
  return trimmed.startsWith("dungeon:") ? trimmed : `dungeon:${trimmed}`
}

export function getDungeonDefinition(key: string): DungeonDefinitionConfig {
  const normalized = normalizeDungeonKey(key)
  const def = DUNGEON_DEFINITIONS.find((d) => d.key === normalized)
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
