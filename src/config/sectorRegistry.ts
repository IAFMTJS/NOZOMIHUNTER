import type { SectorDefinitionContract } from "@/contracts/sector-contract"
import sector01 from "../../content/sectors/sector-01-lost-alphabet/sector.json"

/** GDD Vol 6 sector registry — maps fiction to dungeons and word pools. */
export const SECTOR_REGISTRY: SectorDefinitionContract[] = [
  {
    ...(sector01 as SectorDefinitionContract),
    primaryDungeonKeys: [],
  },
  {
    id: "sector-02",
    index: 2,
    name: "Silent Signals",
    nameJa: "静寂の信号",
    jlptFocus: "Listening N5–N4",
    canonBossName: "Signal Warden",
    canonBossNameJa: "信号番人",
    primaryDungeonKeys: ["dungeon:neon-corridor"],
    wordPoolId: "sector-02-listening",
    heroTheme: "ABANDONED_STATION",
    minLevel: 3,
    description: "Distorted broadcasts leak through dead relays.",
  },
  {
    id: "sector-03",
    index: 3,
    name: "Broken Records",
    nameJa: "壊れた記録",
    jlptFocus: "Vocabulary N4",
    canonBossName: "Memory Eater",
    canonBossNameJa: "記憶喰い",
    primaryDungeonKeys: ["dungeon:shadow-archive"],
    wordPoolId: "sector-03-n4-vocab",
    heroTheme: "SHADOW_ARCHIVE",
    minLevel: 4,
    description: "Cold storage beneath the grid remembers every mistake.",
  },
  {
    id: "sector-04",
    index: 4,
    name: "Ancient Archives",
    nameJa: "古代档案",
    jlptFocus: "Kanji N3",
    canonBossName: "Archive Keeper",
    canonBossNameJa: "档案番",
    primaryDungeonKeys: ["dungeon:abyss-core"],
    wordPoolId: "sector-04-n3-kanji",
    heroTheme: "ABYSS_CORE",
    minLevel: 8,
    description: "Deep kanji clusters resist casual reading.",
  },
  {
    id: "sector-05",
    index: 5,
    name: "Void Library",
    nameJa: "虚空図書",
    jlptFocus: "Mixed N3–N2",
    canonBossName: "Void Priest",
    canonBossNameJa: "虚空司祭",
    primaryDungeonKeys: ["dungeon:corruption-run"],
    wordPoolId: "sector-05-mixed",
    heroTheme: "NEON_CITY",
    minLevel: 5,
    description: "Corruption loops mutate meaning on every breach.",
  },
  {
    id: "sector-06",
    index: 6,
    name: "Echo Nexus",
    nameJa: "反響結節",
    jlptFocus: "Reading N2",
    canonBossName: "The Mirror Hunter",
    canonBossNameJa: "鏡の狩人",
    primaryDungeonKeys: ["dungeon:void-pursuit"],
    wordPoolId: "sector-06-reading",
    heroTheme: "ABANDONED_STATION",
    minLevel: 6,
    description: "Something hunts your slowest decode through dead relays.",
  },
  {
    id: "sector-07",
    index: 7,
    name: "Forgotten Horizon",
    nameJa: "忘れられた地平",
    jlptFocus: "Endgame N1",
    canonBossName: "The Broadcast Spirit",
    canonBossNameJa: "放送霊",
    primaryDungeonKeys: ["dungeon:roguelike-sector"],
    wordPoolId: "sector-07-endgame",
    heroTheme: "CORRUPTED_SHRINE",
    minLevel: 7,
    description: "Procedural modifiers mutate each run at the season horizon.",
  },
]

const BY_ID = new Map(SECTOR_REGISTRY.map((s) => [s.id, s]))

export function getSectorDefinition(sectorId: string): SectorDefinitionContract | null {
  return BY_ID.get(sectorId) ?? null
}

export function listSectorDefinitions(): SectorDefinitionContract[] {
  return SECTOR_REGISTRY
}

export function sectorForDungeonKey(dungeonKey: string): SectorDefinitionContract | null {
  return (
    SECTOR_REGISTRY.find((s) => s.primaryDungeonKeys.includes(dungeonKey)) ?? null
  )
}
