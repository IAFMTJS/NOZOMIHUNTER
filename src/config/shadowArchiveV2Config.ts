import type {
  DungeonBossPhaseSpec,
  DungeonRouteGraph,
} from "@/contracts/dungeon-contract"

export const SHADOW_ARCHIVE_V2_KEY = "dungeon:shadow-archive"

export const SHADOW_ARCHIVE_FORECAST = [
  "Memory debt: ACTIVE",
  "Kanji pressure: HIGH",
  "Archivist trace: PRESENT",
] as const

export const SHADOW_ARCHIVE_ROUTE_GRAPH: DungeonRouteGraph = {
  entryId: "entry",
  nodes: {
    entry: {
      id: "entry",
      label: "Archive Breach",
      type: "ROUTE",
      danger: "low",
      rewardHint: "Choose reading vector",
      exits: ["listening-vault", "lexicon-stack", "story-fragment"],
    },
    "story-fragment": {
      id: "story-fragment",
      label: "Whisper Fragment",
      type: "ENCOUNTER",
      danger: "low",
      rewardHint: "Lore decode",
      roomType: "STORY",
      encounterScriptId: "story-whisper",
      encounterType: "NPC",
      storyRoomCopy: "The archive whisper wants comprehension, not speed.",
      exits: ["memory-hall"],
    },
    "listening-vault": {
      id: "listening-vault",
      label: "Listening Vault",
      type: "ENCOUNTER",
      danger: "medium",
      rewardHint: "Ghost transmissions",
      hazard: "Signal decay on replays",
      encounterType: "LISTENING",
      roomType: "COMBAT",
      encounterScriptId: "listening-vault",
      exits: ["memory-hall"],
    },
    "lexicon-stack": {
      id: "lexicon-stack",
      label: "Lexicon Stack",
      type: "ENCOUNTER",
      danger: "high",
      rewardHint: "Cursed word entries",
      hazard: "Memory debt active",
      encounterType: "VOCAB",
      roomType: "ELITE",
      encounterScriptId: "lexicon-stack",
      exits: ["memory-hall"],
    },
    "memory-hall": {
      id: "memory-hall",
      label: "Memory Hall",
      type: "ENCOUNTER",
      danger: "medium",
      rewardHint: "Semantic seals",
      encounterType: "NPC",
      roomType: "COMBAT",
      encounterScriptId: "memory-hall-npc",
      exits: ["archivist-gate"],
    },
    "archivist-gate": {
      id: "archivist-gate",
      label: "Archivist Gate",
      type: "BOSS_GATE",
      danger: "high",
      rewardHint: "Memory trial confrontation",
      hazard: "Forgotten readings return",
      exits: [],
    },
  },
}

export const ARCHIVIST_BOSS_PHASES: DungeonBossPhaseSpec[] = [
  {
    id: "recall-meaning",
    label: "Recall Meaning",
    encounterKind: "VOCAB",
    wordCount: 3,
  },
  {
    id: "repair-reading",
    label: "Repair Reading",
    encounterKind: "LISTENING",
    fragmentCount: 2,
  },
  {
    id: "identify-intruder",
    label: "Identify Intruder",
    encounterKind: "VOCAB",
    wordCount: 3,
  },
  {
    id: "seal-forgotten",
    label: "Seal the Forgotten Word",
    encounterKind: "VOCAB",
    wordCount: 2,
  },
]
