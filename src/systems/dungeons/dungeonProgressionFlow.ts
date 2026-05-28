import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { clearEncounterPayloads } from "./dungeonEncounterFactory"
import { transition } from "./dungeonStateMachine"
import { initExplorationFields } from "./explorationSystem"
import { resolveDungeonGameMode } from "@/systems/gameModes/gameModeSystem"
import { isDungeonV2Run, resolveBossPhaseCount } from "./dungeonV2Helpers"
import {
  allEncounterNodesComplete,
  isAtBossGate,
  markNodeCompleted,
} from "./dungeonRouteSystem"
import {
  scoreBossPhaseClear,
  scoreSectorClear,
} from "./dungeonRewardSystem"
import { mountBossPhaseEncounter } from "./dungeonBossSystem"
import {
  patchRun,
  advanceDungeonObjective,
  markEncounterComplete,
} from "./dungeonQuestPatch"
import { beginBossPhase } from "./dungeonEngagementFlow"

export function completeDungeonSector(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!

  let updated = advanceDungeonObjective(quest)
  const slot = run.dungeon.encounters[run.currentEncounterIndex]
  if (slot) {
    updated = markEncounterComplete(updated, slot.id)
  }

  let nextRun: DungeonRunContract = {
    ...updated.dungeonRun!,
    machineState: transition(run.machineState, "REWARD"),
    activeType: null,
  }

  if (isDungeonV2Run(run)) {
    if (
      run.pendingExtractionChoice === "PUSH_DEEPER" &&
      run.pushDeepBonusClaimed
    ) {
      return {
        ...updated,
        ...clearEncounterPayloads(),
        dungeonRun: scoreBossPhaseClear({
          ...nextRun,
          machineState: "EXTRACTION",
          extractionChoicePending: false,
          routeSelectPending: false,
        }),
      }
    }
    const nodeId = run.currentNodeId
    if (nodeId) {
      nextRun = markNodeCompleted(nextRun, nodeId)
    }
    nextRun = scoreSectorClear(nextRun)
    nextRun = {
      ...nextRun,
      routeSelectPending: true,
    }
  }

  return {
    ...updated,
    ...clearEncounterPayloads(),
    dungeonRun: nextRun,
  }
}

export function advanceBossPhase(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const nextPhase = run.bossPhase + 1
  const bossPhases = resolveBossPhaseCount(run)

  if (nextPhase >= bossPhases) {
    const cleared = advanceDungeonObjective(quest)
    let finalRun: DungeonRunContract = {
      ...run,
      bossPhase: nextPhase,
      machineState: transition(run.machineState, "EXTRACTION"),
      activeType: null,
    }
    if (isDungeonV2Run(run)) {
      finalRun = scoreBossPhaseClear(finalRun)
      finalRun = {
        ...finalRun,
        extractionChoicePending: true,
      }
    }
    return patchRun({ ...cleared, ...clearEncounterPayloads() }, finalRun)
  }

  const mounted = mountBossPhaseEncounter(
    patchRun(quest, { ...run, bossPhase: nextPhase }),
    nextPhase
  )
  return patchRun(
    { ...quest, ...clearEncounterPayloads(), ...mounted },
    {
      ...run,
      bossPhase: nextPhase,
      machineState: "BOSS",
      activeType: "BOSS",
    }
  )
}

export function continueAfterReward(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const mode = resolveDungeonGameMode(run)

  if (isDungeonV2Run(run)) {
    if (allEncounterNodesComplete(run) && !isAtBossGate(run)) {
      const atGate = patchRun(quest, {
        ...run,
        currentNodeId: "boss-gate",
        routeSelectPending: false,
      })
      return beginBossPhase(atGate)
    }
    return patchRun(
      { ...quest, ...clearEncounterPayloads() },
      {
        ...run,
        machineState: "REWARD",
        routeSelectPending: true,
        activeType: null,
      }
    )
  }

  if (
    mode === "CORRUPTION_RUN" &&
    run.dungeon.encounters.every((e) => e.completed) &&
    run.machineState === "REWARD"
  ) {
    const endlessSectorCount = (run.endlessSectorCount ?? 0) + 1
    const resetEncounters = run.dungeon.encounters.map((e) => ({
      ...e,
      completed: false,
    }))
    const nextRun: DungeonRunContract = {
      ...run,
      endlessSectorCount,
      dungeon: { ...run.dungeon, encounters: resetEncounters },
      machineState: transition("REWARD", "EXPLORATION"),
      currentEncounterIndex: 0,
      activeType: null,
      ...initExplorationFields(),
    }
    return patchRun({ ...quest, ...clearEncounterPayloads() }, nextRun)
  }

  if (
    run.dungeon.encounters.every((e) => e.completed) &&
    run.machineState === "REWARD"
  ) {
    return beginBossPhase(quest)
  }

  const nextIndex = run.dungeon.encounters.findIndex((e) => !e.completed)
  const nextRun: DungeonRunContract = {
    ...run,
    machineState: transition("REWARD", "EXPLORATION"),
    currentEncounterIndex: nextIndex >= 0 ? nextIndex : run.currentEncounterIndex,
    activeType: null,
    ...initExplorationFields(),
  }

  return patchRun({ ...quest, ...clearEncounterPayloads() }, nextRun)
}
