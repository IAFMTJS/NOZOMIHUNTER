import type {
  DungeonBossPhaseSpec,
  DungeonRouteGraph,
} from "@/contracts/dungeon-contract"
import type { DungeonModifierContract } from "@/contracts/game-mode-contract"

export const NEON_CORRIDOR_V2_KEY = "dungeon:neon-corridor"

export const NEON_CORRIDOR_FORECAST = [
  "Vocabulary density: HIGH",
  "Listening distortion: MODERATE",
  "Boss trace: PRESENT",
] as const

export const NEON_CORRIDOR_ROUTE_GRAPH: DungeonRouteGraph = {
  entryId: "entry",
  nodes: {
    entry: {
      id: "entry",
      label: "Sector Breach",
      type: "ROUTE",
      danger: "low",
      rewardHint: "Choose infiltration vector",
      exits: ["neon-hall", "archive-door"],
    },
    "neon-hall": {
      id: "neon-hall",
      label: "Neon Hallway",
      type: "ENCOUNTER",
      danger: "medium",
      rewardHint: "Word data cache",
      hazard: "Audio distortion on listen sectors",
      encounterType: "VOCAB",
      exits: ["signal-hall"],
    },
    "archive-door": {
      id: "archive-door",
      label: "Archive Door",
      type: "ENCOUNTER",
      danger: "high",
      rewardHint: "Rare signal fragments",
      hazard: "Kanji lock pressure",
      encounterType: "LISTENING",
      exits: ["broken-shrine"],
    },
    "signal-hall": {
      id: "signal-hall",
      label: "Signal Hall",
      type: "ENCOUNTER",
      danger: "medium",
      rewardHint: "Intel negotiation",
      hazard: "Trust decay on wrong tone",
      encounterType: "NPC",
      exits: ["boss-gate"],
    },
    "broken-shrine": {
      id: "broken-shrine",
      label: "Broken Shrine",
      type: "ENCOUNTER",
      danger: "high",
      rewardHint: "Voice imprint data",
      hazard: "Speech timing critical",
      encounterType: "SPEECH",
      exits: ["boss-gate"],
    },
    "boss-gate": {
      id: "boss-gate",
      label: "Boss Gate",
      type: "BOSS_GATE",
      danger: "high",
      rewardHint: "Warden confrontation",
      hazard: "Zero margin for decode failure",
      exits: [],
    },
  },
}

export const NEON_CORRIDOR_BOSS_PHASES: DungeonBossPhaseSpec[] = [
  {
    id: "index-scan",
    label: "Index Scan",
    encounterKind: "VOCAB",
    wordCount: 3,
  },
  {
    id: "reading-repair",
    label: "Reading Repair",
    encounterKind: "LISTENING",
    fragmentCount: 2,
  },
  {
    id: "seal-combo",
    label: "Archive Seal",
    encounterKind: "VOCAB",
    wordCount: 2,
  },
]

export const NEON_CORRIDOR_MODIFIER_POOL: Omit<
  DungeonModifierContract,
  "id"
>[] = [
  {
    label: "BLACKOUT",
    kind: "BLACKOUT",
    blackoutRomaji: true,
    corruptionMutation: 1,
  },
  {
    label: "ECHOING WALLS",
    kind: "ECHOING_WALLS",
    autoEchoReplay: true,
    replayBan: true,
    corruptionMutation: 1,
  },
  {
    label: "ARCHIVE FOG",
    kind: "ARCHIVE_FOG",
    archiveFogOnScan: true,
    corruptionMutation: 2,
  },
  {
    label: "HUNTER'S MARK",
    kind: "HUNTERS_MARK",
    huntersMark: true,
    corruptionMutation: 2,
  },
]
