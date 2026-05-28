import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import {
  clearEncounterPayloads,
  mountSectorEncounter,
} from "./dungeonEncounterFactory"
import { transition } from "./dungeonStateMachine"
import { isPursuitCaught, isReadyToEngage } from "./explorationSystem"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import {
  allEncounterNodesComplete,
  getCurrentNode,
  isAtBossGate,
  isNodeCompleted,
} from "./dungeonRouteSystem"
import { shouldForceBossFromAwareness } from "./dungeonThreatSystem"
import { mountBossPhaseEncounter, getBossPhaseSpec } from "./dungeonBossSystem"
import { dialogueOnBossPhase } from "./dungeonMasterDialogueSystem"
import {
  patchRun,
  mountContextFromRun,
} from "./dungeonQuestPatch"

export function beginBossPhase(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const spec = getBossPhaseSpec(quest, run.bossPhase)
  const mounted = mountBossPhaseEncounter(quest, run.bossPhase)
  const from =
    run.machineState === "REWARD" || run.machineState === "EXPLORATION"
      ? run.machineState
      : "EXPLORATION"
  let nextRun: DungeonRunContract = {
    ...run,
    machineState: transition(from, "BOSS"),
    activeType: "BOSS",
    explorationBeat: null,
    routeSelectPending: false,
    bossIntegrity: run.bossIntegrity ?? 100,
  }
  nextRun = dialogueOnBossPhase(nextRun, spec?.label)
  return patchRun({ ...quest, ...clearEncounterPayloads(), ...mounted }, nextRun)
}

function engageSectorEncounterV2(
  quest: QuestContract,
  playerLevel: number
): QuestContract {
  const run = quest.dungeonRun!

  if (run.routeSelectPending) {
    throw new Error("Choose your next route before engaging.")
  }

  if (isAtBossGate(run) || allEncounterNodesComplete(run)) {
    return beginBossPhase(quest)
  }

  const node = getCurrentNode(run)
  if (!node || node.type !== "ENCOUNTER" || !node.encounterType) {
    throw new Error("Current node has no breach encounter.")
  }

  if (isNodeCompleted(run, node.id)) {
    throw new Error("Sector already cleared — select next route.")
  }

  if (shouldForceBossFromAwareness(run)) {
    return beginBossPhase(quest)
  }

  const mounted = mountSectorEncounter(
    node.encounterType,
    node.label,
    mountContextFromRun(run, playerLevel)
  )

  const encounterIndex = run.dungeon.encounters.findIndex(
    (e) => e.type === node.encounterType && !e.completed
  )

  return {
    ...patchRun(
      { ...quest, ...clearEncounterPayloads(), ...mounted },
      {
        ...run,
        machineState: transition(run.machineState, "ENCOUNTER"),
        currentEncounterIndex: encounterIndex >= 0 ? encounterIndex : 0,
        activeType: mounted.activeType,
        explorationBeat: null,
        explorationProgress: 100,
        routeSelectPending: false,
      }
    ),
  }
}

export function engageSectorEncounter(
  quest: QuestContract,
  playerLevel = 1
): QuestContract {
  const run = quest.dungeonRun!
  if (run.machineState === "PREPARATION") {
    throw new Error("Deploy the dungeon before entering a sector")
  }

  if (isDungeonV2Run(run)) {
    return engageSectorEncounterV2(quest, playerLevel)
  }

  if (run.machineState === "EXPLORATION" && !isReadyToEngage(run)) {
    throw new Error("Complete corridor traversal before breaching the sector")
  }

  if (
    run.dungeonMode === "VOID_PURSUIT" &&
    isPursuitCaught(run.pursuitDistance)
  ) {
    throw new Error("Hostile closed distance — sector breach failed.")
  }

  const allSectorsDone = run.dungeon.encounters.every((e) => e.completed)
  if (allSectorsDone) {
    return beginBossPhase(quest)
  }

  const slot = run.dungeon.encounters[run.currentEncounterIndex]
  if (!slot || slot.completed) {
    const nextIndex = run.dungeon.encounters.findIndex((e) => !e.completed)
    if (nextIndex < 0) return beginBossPhase(quest)
    const mounted = mountSectorEncounter(
      run.dungeon.encounters[nextIndex].type,
      String(nextIndex + 1)
    )
    return {
      ...patchRun(
        { ...quest, ...clearEncounterPayloads(), ...mounted },
        {
          ...run,
          machineState: transition(run.machineState, "ENCOUNTER"),
          currentEncounterIndex: nextIndex,
          activeType: mounted.activeType,
          explorationBeat: null,
          explorationProgress: 100,
        }
      ),
    }
  }

  const mounted = mountSectorEncounter(
    slot.type,
    String(run.currentEncounterIndex + 1),
    mountContextFromRun(run, playerLevel)
  )
  return {
    ...patchRun(
      { ...quest, ...clearEncounterPayloads(), ...mounted },
      {
        ...run,
        machineState: transition(run.machineState, "ENCOUNTER"),
        activeType: mounted.activeType,
        explorationBeat: null,
        explorationProgress: 100,
      }
    ),
  }
}
