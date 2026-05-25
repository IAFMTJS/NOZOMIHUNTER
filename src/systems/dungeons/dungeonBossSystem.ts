import type { DungeonBossPhaseSpec } from "@/contracts/dungeon-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  mountBossEncounter,
  type MountedEncounterPayload,
} from "./dungeonEncounterFactory"
import { resolveBossPhaseCount } from "./dungeonV2Helpers"

export function getBossPhaseSpec(
  quest: QuestContract,
  phaseIndex: number
): DungeonBossPhaseSpec | null {
  const specs = quest.dungeonRun?.dungeon.boss?.phaseSpecs
  if (!specs?.length) return null
  return specs[phaseIndex] ?? null
}

export function mountBossPhaseEncounter(
  quest: QuestContract,
  phaseIndex: number
): MountedEncounterPayload {
  const run = quest.dungeonRun!
  const spec = getBossPhaseSpec(quest, phaseIndex)
  if (!spec) {
    return mountBossEncounter(phaseIndex)
  }

  const label = run.dungeon.boss?.name ?? "Warden"
  switch (spec.encounterKind) {
    case "VOCAB":
      return mountBossEncounter(phaseIndex, {
        phaseSpec: spec,
        sectorLabel: `${label} — ${spec.label}`,
      })
    case "LISTENING":
      return mountBossEncounter(phaseIndex, {
        phaseSpec: spec,
        sectorLabel: `${label} — ${spec.label}`,
        forceListening: true,
      })
    case "SPEECH":
      return mountBossEncounter(phaseIndex, {
        phaseSpec: spec,
        sectorLabel: `${label} — ${spec.label}`,
        forceSpeech: true,
      })
    case "NPC":
      return mountBossEncounter(phaseIndex, {
        phaseSpec: spec,
        sectorLabel: `${label} — ${spec.label}`,
        forceNpc: true,
      })
    default:
      return mountBossEncounter(phaseIndex, { phaseSpec: spec })
  }
}

export function bossPhasesRemaining(quest: QuestContract): number {
  const run = quest.dungeonRun!
  return resolveBossPhaseCount(run) - run.bossPhase
}
