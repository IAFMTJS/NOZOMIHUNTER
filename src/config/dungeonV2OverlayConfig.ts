import type {
  DungeonBossPhaseSpec,
  DungeonRouteGraph,
} from "@/contracts/dungeon-contract"

function linearRoute(
  key: string,
  sectors: { id: string; label: string; type: "VOCAB" | "LISTENING" | "SPEECH" | "NPC" }[]
): DungeonRouteGraph {
  const nodes: DungeonRouteGraph["nodes"] = {
    entry: {
      id: "entry",
      label: "Sector Breach",
      type: "ROUTE",
      danger: "low",
      rewardHint: "Begin infiltration",
      exits: [sectors[0]?.id ?? "s0"],
    },
  }
  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i]!
    const next = sectors[i + 1]?.id ?? "boss-gate"
    nodes[s.id] = {
      id: s.id,
      label: s.label,
      type: "ENCOUNTER",
      danger: i >= sectors.length - 1 ? "high" : "medium",
      rewardHint: "Sector data",
      encounterType: s.type,
      exits: [next],
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
  { id: "phase-3", label: "Final Seal", encounterKind: "VOCAB", wordCount: 2 },
]

export const ABYSS_CORE_ROUTE = linearRoute("abyss", [
  { id: "vocab", label: "Abyss Lexicon", type: "VOCAB" },
  { id: "listen", label: "Deep Signal", type: "LISTENING" },
  { id: "npc", label: "Hostile Relay", type: "NPC" },
  { id: "speech", label: "Voice Breach", type: "SPEECH" },
])

export const CORRUPTION_RUN_ROUTE = linearRoute("corruption", [
  { id: "vocab", label: "Loop Lexicon", type: "VOCAB" },
  { id: "listen", label: "Static Loop", type: "LISTENING" },
  { id: "speech", label: "Collapse Speech", type: "SPEECH" },
])

export const VOID_PURSUIT_ROUTE = linearRoute("void", [
  { id: "listen", label: "Relay Chase", type: "LISTENING" },
  { id: "vocab", label: "Mirror Lexicon", type: "VOCAB" },
  { id: "npc", label: "Hunter Echo", type: "NPC" },
])

export const ROGUELIKE_SECTOR_ROUTE = linearRoute("rogue", [
  { id: "vocab", label: "Shrine Lexicon", type: "VOCAB" },
  { id: "listen", label: "Broken Signal", type: "LISTENING" },
  { id: "speech", label: "Ritual Voice", type: "SPEECH" },
  { id: "npc", label: "Spirit Dialogue", type: "NPC" },
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
