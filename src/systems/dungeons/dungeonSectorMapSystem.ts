import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import {
  listAllDungeonDefinitions,
  resolveDungeonAccess,
  type DungeonAccessResult,
} from "@/systems/dungeons/dungeonAccess"
import { getNextDungeonForecast } from "@/systems/dungeons/dungeonForecastSystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"

export interface SectorMapNode {
  dungeonKey: string
  name: string
  depth: number
  breachLabel: string
  access: DungeonAccessResult
  dangerTier: number
  isNextGate: boolean
  canEnter: boolean
  playerReadiness: number
  recommendedReadiness: number
  readinessBlocked: boolean
}

function dangerTier(def: DungeonDefinitionConfig): number {
  const maxDiff = Math.max(
    ...def.encounterPlan.map((e) => e.difficulty),
    1
  )
  return def.minLevel * 2 + maxDiff
}

const BREACH_LABELS = ["α", "β", "γ", "δ"] as const

export function buildSectorMap(
  player: PlayerContract,
  activeQuests: QuestContract[]
): SectorMapNode[] {
  const dungeons = listAllDungeonDefinitions()
  const forecast = getNextDungeonForecast(player, activeQuests)
  const readiness = computeReadiness({ player })

  return dungeons.map((def, index) => {
    const access = resolveDungeonAccess(player, activeQuests, def.key)
    const recommended = Math.min(95, 40 + def.minLevel * 12 + dangerTier(def) * 3)
    const isNextGate = forecast?.dungeon.key === def.key
    const readinessBlocked =
      access.canEnter && readiness.preparationScore < recommended

    return {
      dungeonKey: def.key,
      name: def.name,
      depth: index,
      breachLabel: BREACH_LABELS[index] ?? String(index + 1),
      access,
      dangerTier: dangerTier(def),
      isNextGate,
      canEnter: access.canEnter,
      playerReadiness: readiness.preparationScore,
      recommendedReadiness: recommended,
      readinessBlocked,
    }
  })
}

export function resolveDungeonDeployAdvisory(
  player: PlayerContract,
  activeQuests: QuestContract[],
  dungeonKey: string
): { allowed: boolean; warning?: string } {
  const node = buildSectorMap(player, activeQuests).find(
    (n) => n.dungeonKey === dungeonKey
  )
  if (!node) return { allowed: false, warning: "Unknown sector." }
  if (!node.access.canEnter) {
    return { allowed: false, warning: node.access.reason }
  }
  if (node.readinessBlocked) {
    return {
      allowed: true,
      warning: `Readiness ${node.playerReadiness}% below ${node.recommendedReadiness}% advisory. Deployment at your risk.`,
    }
  }
  return { allowed: true }
}
