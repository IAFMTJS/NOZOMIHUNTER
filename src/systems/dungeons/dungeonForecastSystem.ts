import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  listAllDungeonDefinitions,
  resolveDungeonAccess,
  type DungeonAccessResult,
} from "@/systems/dungeons/dungeonAccess"
import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import { computeReadiness } from "@/systems/readiness/readinessSystem"

export interface DungeonForecastContract {
  dungeon: DungeonDefinitionConfig
  access: DungeonAccessResult
  dangerTier: number
  recommendedReadiness: number
  headline: string
  subline: string
  playerReadiness: number
  isReady: boolean
}

function dangerTier(def: DungeonDefinitionConfig): number {
  const maxDiff = Math.max(
    ...def.encounterPlan.map((e) => e.difficulty),
    1
  )
  return def.minLevel * 2 + maxDiff
}

export function getNextDungeonForecast(
  player: PlayerContract,
  activeQuests: QuestContract[]
): DungeonForecastContract | null {
  const dungeons = listAllDungeonDefinitions()
  const readiness = computeReadiness({ player })

  for (const def of dungeons) {
    const access = resolveDungeonAccess(player, activeQuests, def.key)
    if (access.canEnter) continue

    const tier = dangerTier(def)
    const recommended = Math.min(
      95,
      40 + def.minLevel * 12 + tier * 3
    )
    const isReady = readiness.preparationScore >= recommended

    let headline = "Next gate"
    let subline = access.reason

    if (access.status === "locked_level") {
      headline = "Threat detected"
      subline = `Clearance L${access.minLevel} required · ${access.reason}`
    } else if (access.status === "locked_prerequisite") {
      headline = "Next sector sealed"
      subline = access.reason
    } else if (access.status === "blocked_active_run") {
      headline = "Corridor occupied"
      subline = access.reason
    }

    if (!isReady && access.status !== "blocked_active_run") {
      subline = `${subline} · Readiness ${readiness.preparationScore}% below ${recommended}% advisory`
    }

    return {
      dungeon: def,
      access,
      dangerTier: tier,
      recommendedReadiness: recommended,
      headline,
      subline,
      playerReadiness: readiness.preparationScore,
      isReady,
    }
  }

  const last = dungeons[dungeons.length - 1]
  if (!last) return null

  const access = resolveDungeonAccess(player, activeQuests, last.key)
  return {
    dungeon: last,
    access,
    dangerTier: dangerTier(last),
    recommendedReadiness: 70,
    headline: "All corridors registered",
    subline: "Maintain discipline. New sectors deploy with rank growth.",
    playerReadiness: readiness.preparationScore,
    isReady: true,
  }
}
