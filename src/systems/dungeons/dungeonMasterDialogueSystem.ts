import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type {
  MasterDialogueContext,
  MasterDialogueMoment,
  MasterDialogueResult,
  MasterRelationshipState,
} from "@/contracts/dungeon-master-contract"
import { pickDialogueLine } from "@/config/dungeonMastersConfig"
import { resolveMasterForRun } from "./dungeonMasterSystem"
import { masterAwarenessTier } from "./dungeonMasterSystem"

export function buildDialogueSeed(run: DungeonRunContract, moment: MasterDialogueMoment): string {
  return `${run.dungeon.id}:${moment}:${run.bossPhase}:${Date.now()}`
}

export function resolveMasterDialogue(
  run: DungeonRunContract,
  ctx: Omit<MasterDialogueContext, "masterId">
): MasterDialogueResult | null {
  const master = resolveMasterForRun(run)
  const seed = ctx.seed ?? buildDialogueSeed(run, ctx.moment)
  const line = pickDialogueLine(master, ctx.moment, seed)
  if (!line) return null
  return { line, moment: ctx.moment, suppressMs: ctx.moment === "BOSS_PHASE" ? 2400 : undefined }
}

export function applyMasterDialogue(
  run: DungeonRunContract,
  result: MasterDialogueResult | null
): DungeonRunContract {
  if (!result) return run
  return {
    ...run,
    masterDialogueLine: result.line,
    masterDialogueMoment: result.moment,
    explorationSystemLine: result.line,
  }
}

export function emitDialogueForMoment(
  run: DungeonRunContract,
  moment: MasterDialogueMoment,
  extras?: Partial<MasterDialogueContext>
): DungeonRunContract {
  const result = resolveMasterDialogue(run, {
    moment,
    streak: extras?.streak,
    encounterFailures: extras?.encounterFailures ?? run.encounterFailures,
    corruptionPressure: extras?.corruptionPressure ?? run.threat?.corruptionPressure,
    bossAwareness: extras?.bossAwareness ?? run.threat?.bossAwareness,
    relationshipState: extras?.relationshipState,
    weakWordCount: extras?.weakWordCount,
    phaseIndex: extras?.phaseIndex ?? run.bossPhase,
    phaseLabel: extras?.phaseLabel,
    seed: extras?.seed,
  })
  return applyMasterDialogue(run, result)
}

export function dialogueOnDeploy(
  run: DungeonRunContract,
  relationshipState?: MasterRelationshipState
): DungeonRunContract {
  const moment: MasterDialogueMoment =
    relationshipState && relationshipState !== "UNKNOWN" && relationshipState !== "OBSERVING"
      ? "REMATCH"
      : "ENTRY"
  return emitDialogueForMoment(run, moment, { relationshipState })
}

export function dialogueOnFirstMistake(run: DungeonRunContract): DungeonRunContract {
  if (run.firstMistakeLogged) return run
  const next = emitDialogueForMoment(run, "FIRST_MISTAKE")
  return { ...next, firstMistakeLogged: true }
}

export function dialogueOnStreak(run: DungeonRunContract, streak: number): DungeonRunContract {
  if (streak < 3) return run
  return emitDialogueForMoment(run, "STREAK", { streak })
}

export function dialogueOnCorruptionBand(run: DungeonRunContract): DungeonRunContract {
  const corruption = run.threat?.corruptionPressure ?? 0
  const band = corruption >= 75 ? 75 : corruption >= 50 ? 50 : 0
  if (band === 0 || run.lastCorruptionBand === band) return run
  return {
    ...emitDialogueForMoment(run, "CORRUPTION", { corruptionPressure: corruption }),
    lastCorruptionBand: band,
  }
}

export function dialogueOnAwarenessTier(run: DungeonRunContract): DungeonRunContract {
  const awareness = run.threat?.bossAwareness ?? 0
  const tier = masterAwarenessTier(awareness)
  if (tier === 0 || run.lastAwarenessTier === tier) return run
  return {
    ...emitDialogueForMoment(run, "BOSS_AWARENESS", { bossAwareness: awareness }),
    lastAwarenessTier: tier,
  }
}

export function dialogueOnBossPhase(
  run: DungeonRunContract,
  phaseLabel?: string
): DungeonRunContract {
  return emitDialogueForMoment(run, "BOSS_PHASE", {
    phaseIndex: run.bossPhase,
    phaseLabel,
  })
}

export function dialogueOnRouteChoice(run: DungeonRunContract): DungeonRunContract {
  return emitDialogueForMoment(run, "ROUTE_CHOICE")
}

export function dialogueOnExtraction(run: DungeonRunContract): DungeonRunContract {
  return emitDialogueForMoment(run, "EXTRACTION")
}

export function dialogueOnFailure(run: DungeonRunContract): DungeonRunContract {
  return emitDialogueForMoment(run, "FAILURE")
}

export function dialogueOnPerfectClear(run: DungeonRunContract): DungeonRunContract {
  return emitDialogueForMoment(run, "PERFECT_CLEAR")
}

export function isPerfectClearRun(run: DungeonRunContract): boolean {
  return (
    run.encounterFailures === 0 &&
    (run.threat?.corruptionPressure ?? 0) < 40
  )
}
