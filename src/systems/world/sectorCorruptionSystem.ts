import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { corruptionBandFromPercent } from "@/config/corruptionThresholds"
import { buildWorldMapNodes } from "@/systems/world/worldMapSystem"
import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import {
  getActiveLanguageInvasion,
  invasionCorruptionDrift,
} from "@/systems/retention/languageInvasionSystem"

export interface SectorCorruptionViewModel {
  sectorKey: string
  sectorName: string
  corruptionPercent: number
  band: ReturnType<typeof corruptionBandFromPercent>
  breachDelta: number
  subline: string
}

function activeDungeonRun(
  activeQuests: QuestContract[]
): DungeonRunContract | null {
  for (const q of activeQuests) {
    if (q.type === "DUNGEON" && q.dungeonRun) return q.dungeonRun
  }
  return null
}

export function resolvePrimarySector(
  player: PlayerContract,
  activeQuests: QuestContract[]
): { key: string; name: string } {
  const run = activeDungeonRun(activeQuests)
  if (run?.dungeon) {
    return { key: run.dungeon.id, name: run.dungeon.name }
  }
  const unlocked = player.progression.unlockedDungeons
  const last =
    unlocked.length > 0 ? unlocked[unlocked.length - 1] : "dungeon:neon-corridor"
  const slug = last.replace(/^dungeon:/, "")
  const def = DUNGEON_DEFINITIONS.find(
    (d) => d.key === last || d.key.endsWith(slug)
  )
  return { key: last, name: def?.name ?? "Neon Corridor" }
}

export function buildSectorCorruptionView(
  player: PlayerContract,
  activeQuests: QuestContract[],
  seed?: string
): SectorCorruptionViewModel {
  const sector = resolvePrimarySector(player, activeQuests)
  const run = activeDungeonRun(activeQuests)

  let corruptionPercent: number
  if (run?.sectorCorruption != null) {
    corruptionPercent = run.sectorCorruption
  } else if (run?.threat?.corruptionPressure != null) {
    corruptionPercent = Math.round(run.threat.corruptionPressure)
  } else {
    const nodes = buildWorldMapNodes(player)
    const node = nodes.find((n) => n.key === sector.key || n.name === sector.name)
    corruptionPercent = node?.corruptionIndex ?? 42
  }

  const invasion = getActiveLanguageInvasion(seed)
  const drift = invasionCorruptionDrift(invasion)
  if (drift > 0) {
    corruptionPercent = Math.min(100, corruptionPercent + drift)
  }

  const band = corruptionBandFromPercent(corruptionPercent)
  const breachAt = 80
  const breachDelta = Math.max(0, breachAt - corruptionPercent)

  const subline =
    breachDelta <= 2
      ? "Breach risk critical — seal or extract"
      : breachDelta <= 10
        ? "Breach risk increasing"
        : "Sector signal within tolerance"

  return {
    sectorKey: sector.key,
    sectorName: sector.name,
    corruptionPercent,
    band,
    breachDelta,
    subline,
  }
}
