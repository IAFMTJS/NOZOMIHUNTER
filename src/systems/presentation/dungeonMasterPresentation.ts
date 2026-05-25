import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type { MasterPresenceView } from "@/contracts/dungeon-master-contract"
import { buildMasterPresenceView, resolveMasterForRun } from "@/systems/dungeons/dungeonMasterSystem"

export function formatMasterDialogueBanner(line: string | null | undefined): string | null {
  if (!line?.trim()) return null
  return line.trim()
}

export function masterRuleBriefingLine(run: DungeonRunContract): string {
  const master = resolveMasterForRun(run)
  return `${master.displayName} · ${master.uniqueRuleSummary}`
}

export function masterEntryBriefing(run: DungeonRunContract, baseDescription: string): string {
  const master = resolveMasterForRun(run)
  const line = run.masterDialogueLine ?? master.uniqueRuleSummary
  return `${baseDescription} · Domain: ${master.domainLabel} · ${line}`
}

export function resolvePresenceForUi(run: DungeonRunContract): MasterPresenceView {
  return buildMasterPresenceView(run)
}

export function bossIntegrityLabel(integrity: number | undefined): string {
  const v = integrity ?? 100
  if (v <= 0) return "Seal shattered"
  if (v <= 25) return "Critical fracture"
  if (v <= 50) return "Integrity compromised"
  if (v <= 75) return "Seal holding"
  return "Boss integrity stable"
}

export function bossIntegrityPercent(run: DungeonRunContract): number {
  if (run.bossIntegrity != null) return run.bossIntegrity
  const phases = run.dungeon.boss?.phaseSpecs?.length ?? run.dungeon.boss?.phases ?? 2
  const remaining = Math.max(0, phases - run.bossPhase)
  return Math.round((remaining / phases) * 100)
}
