import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type {
  DungeonMasterDefinition,
  DungeonMasterId,
  MasterAwarenessTier,
  MasterPresenceView,
} from "@/contracts/dungeon-master-contract"
import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import {
  getMasterDefinition,
  resolveMasterIdForDungeonKey,
} from "@/config/dungeonMastersConfig"
import { BOSS_AWARENESS_THRESHOLDS } from "./dungeonThreatSystem"

export function resolveMasterForDungeonKey(key: string): DungeonMasterDefinition {
  const id = resolveMasterIdForDungeonKey(key)
  return getMasterDefinition(id)
}

export function resolveMasterForDefinition(
  definition: DungeonDefinitionConfig
): DungeonMasterDefinition {
  const id = definition.masterId ?? resolveMasterIdForDungeonKey(definition.key)
  return getMasterDefinition(id)
}

export function resolveMasterForRun(run: DungeonRunContract): DungeonMasterDefinition {
  const id =
    run.dungeon.masterId ??
    run.masterId ??
    resolveMasterIdForDungeonKey(extractDungeonKeyFromRun(run))
  return getMasterDefinition(id)
}

function extractDungeonKeyFromRun(run: DungeonRunContract): string {
  const bossId = run.dungeon.boss?.id ?? ""
  const match = bossId.match(/^boss-(dungeon:[\w-]+)/)
  if (match?.[1]) return match[1]
  const idMatch = run.dungeon.id.match(/dungeon-(dungeon:[\w-]+)-/)
  if (idMatch?.[1]) return idMatch[1]
  return "dungeon:neon-corridor"
}

export function masterAwarenessTier(bossAwareness: number): MasterAwarenessTier {
  if (bossAwareness >= BOSS_AWARENESS_THRESHOLDS.forced) return 100
  if (bossAwareness >= BOSS_AWARENESS_THRESHOLDS.miniBoss) return 75
  if (bossAwareness >= BOSS_AWARENESS_THRESHOLDS.interrupt) return 50
  if (bossAwareness >= BOSS_AWARENESS_THRESHOLDS.whisper) return 25
  return 0
}

export function buildMasterPresenceView(run: DungeonRunContract): MasterPresenceView {
  const master = resolveMasterForRun(run)
  const awareness = run.threat?.bossAwareness ?? 0
  const tier = masterAwarenessTier(awareness)
  return {
    masterId: master.id,
    displayName: master.displayName,
    crestGlyph: master.crestGlyph,
    domainLabel: master.domainLabel,
    awarenessTier: tier,
    dialogueLine: run.masterDialogueLine ?? null,
    cssClass: master.visualProfile.cssClass,
    presenceClass: `nozomi-master-presence--${tier}`,
  }
}

export function bossDisplayName(run: DungeonRunContract): string {
  const master = resolveMasterForRun(run)
  return master.displayName
}

export function attachMasterToDungeon<T extends { masterId?: DungeonMasterId }>(
  dungeon: T,
  masterId: DungeonMasterId
): T & { masterId: DungeonMasterId } {
  return { ...dungeon, masterId }
}
