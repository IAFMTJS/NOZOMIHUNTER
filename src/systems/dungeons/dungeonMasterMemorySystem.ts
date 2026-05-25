import type { PlayerContract } from "@/contracts/player-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type {
  DungeonMasterId,
  MasterRelationshipState,
} from "@/contracts/dungeon-master-contract"
import type { DungeonModifierContract } from "@/contracts/game-mode-contract"
import { getMasterDefinition } from "@/config/dungeonMastersConfig"
import { resolveMasterForRun } from "./dungeonMasterSystem"
import { isPerfectClearRun } from "./dungeonMasterDialogueSystem"
import { rollSingleModifier } from "./dungeonModifierSystem"
import { NEON_CORRIDOR_MODIFIER_POOL } from "@/config/neonCorridorV2Config"

export interface MasterRunOutcomeMetrics {
  cleared: boolean
  perfectClear: boolean
  encounterFailures: number
  corruptionPressure: number
  bossPhaseReached: number
  runScore: number
}

export interface MasterMemorySnapshot {
  masterId: DungeonMasterId
  clears: number
  failures: number
  relationshipState: MasterRelationshipState
}

const RELATIONSHIP_TITLE_PREFIX = "master:"

export function relationshipTitleKey(masterId: DungeonMasterId, state: MasterRelationshipState): string {
  return `${RELATIONSHIP_TITLE_PREFIX}${masterId}:${state.toLowerCase()}`
}

export function relicUnlockKey(relicKey: string): string {
  return `relic:${relicKey}`
}

export function parseMasterMemoryFromPlayer(player: PlayerContract): Map<DungeonMasterId, MasterMemorySnapshot> {
  const map = new Map<DungeonMasterId, MasterMemorySnapshot>()
  for (const title of player.progression.titles) {
    if (!title.startsWith(RELATIONSHIP_TITLE_PREFIX)) continue
    const rest = title.slice(RELATIONSHIP_TITLE_PREFIX.length)
    const colon = rest.lastIndexOf(":")
    if (colon < 0) continue
    const masterId = rest.slice(0, colon) as DungeonMasterId
    const state = rest.slice(colon + 1).toUpperCase() as MasterRelationshipState
    const existing = map.get(masterId)
    map.set(masterId, {
      masterId,
      clears: existing?.clears ?? 0,
      failures: existing?.failures ?? 0,
      relationshipState: state,
    })
  }
  return map
}

export function resolveRelationshipState(
  clears: number,
  perfectClears: number,
  failures: number
): MasterRelationshipState {
  if (clears >= 5 && perfectClears >= 2) return "BOUND"
  if (clears >= 3) return "RIVAL"
  if (perfectClears >= 1) return "PROVOKED"
  if (clears >= 1 || failures >= 2) return "OBSERVING"
  return "UNKNOWN"
}

export function getRelationshipForMaster(
  player: PlayerContract,
  masterId: DungeonMasterId
): MasterRelationshipState {
  const snap = parseMasterMemoryFromPlayer(player).get(masterId)
  return snap?.relationshipState ?? "UNKNOWN"
}

export function buildRunOutcomeMetrics(run: DungeonRunContract, cleared: boolean): MasterRunOutcomeMetrics {
  return {
    cleared,
    perfectClear: cleared && isPerfectClearRun(run),
    encounterFailures: run.encounterFailures,
    corruptionPressure: run.threat?.corruptionPressure ?? 0,
    bossPhaseReached: run.bossPhase,
    runScore: run.runScore ?? 0,
  }
}

export interface MasterCompletionGrants {
  titles: string[]
  relicKeys: string[]
  inventoryItems: { itemKey: string; quantity: number }[]
}

export function computeMasterCompletionGrants(
  run: DungeonRunContract,
  player: PlayerContract,
  metrics: MasterRunOutcomeMetrics
): MasterCompletionGrants {
  if (!metrics.cleared) {
    return { titles: [], relicKeys: [], inventoryItems: [] }
  }

  const master = resolveMasterForRun(run)
  const memory = parseMasterMemoryFromPlayer(player)
  const prev = memory.get(master.id)
  const clears = (prev?.clears ?? 0) + 1
  const failures = metrics.perfectClear ? prev?.failures ?? 0 : (prev?.failures ?? 0) + 1
  const perfectClears = (metrics.perfectClear ? 1 : 0) + (prev?.relationshipState === "PROVOKED" ? 1 : 0)

  const relationship = resolveRelationshipState(clears, perfectClears, failures)
  const titles = [relationshipTitleKey(master.id, relationship)]

  const inventoryItems: { itemKey: string; quantity: number }[] = []
  const relicKeys: string[] = []

  if (metrics.perfectClear) {
    titles.push(master.perfectClearReward.title)
    relicKeys.push(master.perfectClearReward.relicKey)
    inventoryItems.push({
      itemKey: master.perfectClearReward.relicKey,
      quantity: 1,
    })
  }

  return { titles, relicKeys, inventoryItems }
}

export function pickRematchModifier(
  masterId: DungeonMasterId,
  relationship: MasterRelationshipState,
  seed: string
): DungeonModifierContract | undefined {
  const master = getMasterDefinition(masterId)
  const template = master.rematchModifiers?.[relationship]
  if (!template) {
    if (relationship === "RIVAL" || relationship === "BOUND") {
      return rollSingleModifier(NEON_CORRIDOR_MODIFIER_POOL, `${seed}:rematch`)
    }
    return undefined
  }
  return rollSingleModifier([template], `${seed}:master-rematch`)
}

export function applyRematchModifierToRun(
  run: DungeonRunContract,
  player: PlayerContract
): DungeonRunContract {
  const master = resolveMasterForRun(run)
  const relationship = getRelationshipForMaster(player, master.id)
  if (relationship === "UNKNOWN" || relationship === "OBSERVING") {
    return run
  }
  const mod = pickRematchModifier(master.id, relationship, run.dungeon.id)
  if (!mod) return run
  return {
    ...run,
    activeModifier: mod,
    modifiers: run.modifiers ? [...run.modifiers, mod] : [mod],
  }
}

export function formatMasterRecordDetail(
  masterId: DungeonMasterId,
  relationship: MasterRelationshipState
): string {
  const master = getMasterDefinition(masterId)
  return `${master.displayName} · ${relationship.toLowerCase()}`
}
