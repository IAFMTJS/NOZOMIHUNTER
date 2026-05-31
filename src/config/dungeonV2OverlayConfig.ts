import type {
  DungeonBossPhaseSpec,
  DungeonRouteGraph,
} from "@/contracts/dungeon-contract"

function branchingRoute(
  sectors: {
    id: string
    label: string
    type: "VOCAB" | "LISTENING" | "SPEECH" | "NPC"
    roomType?: "COMBAT" | "ELITE" | "STORY" | "RECOVERY" | "TREASURE"
    encounterScriptId?: string
    storyRoomCopy?: string
    exits?: string[]
  }[]
): DungeonRouteGraph {
  const nodes: DungeonRouteGraph["nodes"] = {
    entry: {
      id: "entry",
      label: "Sector Breach",
      type: "ROUTE",
      danger: "low",
      rewardHint: "Choose infiltration vector",
      exits: [sectors[0]?.id ?? "s0"],
    },
  }
  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i]!
    const defaultNext = sectors[i + 1]?.id ?? "boss-gate"
    nodes[s.id] = {
      id: s.id,
      label: s.label,
      type: "ENCOUNTER",
      danger: s.roomType === "ELITE" ? "high" : i >= sectors.length - 2 ? "high" : "medium",
      rewardHint:
        s.roomType === "TREASURE"
          ? "Relic cache"
          : s.roomType === "RECOVERY"
            ? "Stabilization"
            : "Sector data",
      encounterType: s.type,
      roomType: s.roomType ?? "COMBAT",
      encounterScriptId: s.encounterScriptId,
      storyRoomCopy: s.storyRoomCopy,
      exits: s.exits ?? [defaultNext],
    }
  }
  nodes["boss-gate"] = {
    id: "boss-gate",
    label: "Boss Gate",
    type: "BOSS_GATE",
    danger: "high",
    rewardHint: "Warden confrontation",
    exits: [],
  }
  return { entryId: "entry", nodes }
}

const DEFAULT_BOSS_PHASES: DungeonBossPhaseSpec[] = [
  { id: "phase-1", label: "Seal Breach", encounterKind: "VOCAB", wordCount: 2 },
  { id: "phase-2", label: "Signal Lock", encounterKind: "LISTENING", fragmentCount: 2 },
  { id: "phase-3", label: "Voice Trial", encounterKind: "SPEECH" },
  { id: "phase-4", label: "Hostile Relay", encounterKind: "NPC" },
  { id: "phase-5", label: "Final Seal", encounterKind: "VOCAB", wordCount: 3 },
]

export const ABYSS_CORE_ROUTE = branchingRoute([
  {
    id: "vocab",
    label: "Abyss Lexicon",
    type: "VOCAB",
    roomType: "ELITE",
    encounterScriptId: "abyss-vocab",
  },
  {
    id: "recovery",
    label: "Pressure Alcove",
    type: "VOCAB",
    roomType: "RECOVERY",
    storyRoomCopy: "Brief stabilization before the deep signal.",
    exits: ["listen"],
  },
  {
    id: "listen",
    label: "Deep Signal",
    type: "LISTENING",
    roomType: "COMBAT",
  },
  {
    id: "story-echo",
    label: "Abyss Whisper",
    type: "NPC",
    roomType: "STORY",
    storyRoomCopy: "Something speaks in kanji you almost recognize.",
    exits: ["speech"],
  },
  { id: "speech", label: "Voice Breach", type: "SPEECH" },
  { id: "npc", label: "Hostile Relay", type: "NPC" },
])

export const CORRUPTION_RUN_ROUTE = branchingRoute([
  { id: "vocab", label: "Loop Lexicon", type: "VOCAB", roomType: "COMBAT" },
  {
    id: "treasure",
    label: "Collapse Cache",
    type: "VOCAB",
    roomType: "TREASURE",
    storyRoomCopy: "Relic shard stabilized between loops.",
    exits: ["listen"],
  },
  { id: "listen", label: "Static Loop", type: "LISTENING", roomType: "ELITE" },
  { id: "speech", label: "Collapse Speech", type: "SPEECH" },
])

export const VOID_PURSUIT_ROUTE = branchingRoute([
  { id: "listen", label: "Relay Chase", type: "LISTENING", encounterScriptId: "void-listen" },
  {
    id: "recovery",
    label: "Dead Relay",
    type: "LISTENING",
    roomType: "RECOVERY",
    storyRoomCopy: "Distance widens — breathe before the mirror answers.",
    exits: ["vocab"],
  },
  { id: "vocab", label: "Mirror Lexicon", type: "VOCAB", roomType: "ELITE" },
  { id: "npc", label: "Hunter Echo", type: "NPC", roomType: "STORY" },
])

export const ROGUELIKE_SECTOR_ROUTE = branchingRoute([
  { id: "vocab", label: "Shrine Lexicon", type: "VOCAB" },
  {
    id: "story-shrine",
    label: "Broken Signal",
    type: "LISTENING",
    roomType: "STORY",
    storyRoomCopy: "Shrine static resolves into half a sentence.",
    exits: ["listen"],
  },
  { id: "listen", label: "Broken Signal", type: "LISTENING" },
  {
    id: "treasure",
    label: "Shrine Relic",
    type: "VOCAB",
    roomType: "TREASURE",
    exits: ["speech"],
  },
  { id: "speech", label: "Ritual Voice", type: "SPEECH", encounterScriptId: "rogue-speech" },
  { id: "npc", label: "Spirit Dialogue", type: "NPC", roomType: "ELITE" },
])

export const DUNGEON_V2_OVERLAY: Record<
  string,
  { routeGraph: DungeonRouteGraph; bossPhaseSpecs: DungeonBossPhaseSpec[] }
> = {
  "dungeon:abyss-core": {
    routeGraph: ABYSS_CORE_ROUTE,
    bossPhaseSpecs: DEFAULT_BOSS_PHASES,
  },
  "dungeon:corruption-run": {
    routeGraph: CORRUPTION_RUN_ROUTE,
    bossPhaseSpecs: DEFAULT_BOSS_PHASES,
  },
  "dungeon:void-pursuit": {
    routeGraph: VOID_PURSUIT_ROUTE,
    bossPhaseSpecs: DEFAULT_BOSS_PHASES,
  },
  "dungeon:roguelike-sector": {
    routeGraph: ROGUELIKE_SECTOR_ROUTE,
    bossPhaseSpecs: DEFAULT_BOSS_PHASES,
  },
}
