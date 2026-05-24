import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract, ExplorationAction } from "@/contracts/dungeon-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { maxDungeonEncounterFailures } from "@/systems/penalties/penaltyGameplaySystem"
import { advanceObjective } from "@/systems/quests/questValidator"
import { failQuest } from "@/systems/quests/questOrchestrator"
import {
  clearEncounterPayloads,
  mountBossEncounter,
  mountSectorEncounter,
} from "./dungeonEncounterFactory"
import { transition } from "./dungeonStateMachine"
import {
  advanceExploration,
  initExplorationFields,
  isPursuitCaught,
  isReadyToEngage,
} from "./explorationSystem"
import { resolveDungeonGameMode } from "@/systems/gameModes/gameModeSystem"

const OBJECTIVE_ID = "obj-dungeon"

function patchRun(
  quest: QuestContract,
  run: DungeonRunContract
): QuestContract {
  if (!quest.dungeonRun) return quest
  return { ...quest, dungeonRun: run }
}

function advanceDungeonObjective(quest: QuestContract): QuestContract {
  return {
    ...quest,
    objectives: advanceObjective(quest.objectives, OBJECTIVE_ID, 1),
  }
}

function markEncounterComplete(
  quest: QuestContract,
  encounterId: string
): QuestContract {
  const run = quest.dungeonRun!
  const encounters = run.dungeon.encounters.map((e) =>
    e.id === encounterId ? { ...e, completed: true } : e
  )
  return patchRun(quest, {
    ...run,
    dungeon: { ...run.dungeon, encounters },
  })
}

export function deployDungeon(
  quest: QuestContract,
  playerId: string
): QuestContract {
  const run = quest.dungeonRun!
  const nextRun: DungeonRunContract = {
    ...run,
    machineState: transition(run.machineState, "EXPLORATION"),
    ...initExplorationFields(),
  }
  eventBus.emit(GAME_EVENTS.DUNGEON_ENTERED, {
    playerId,
    dungeonId: run.dungeon.id,
    theme: run.dungeon.theme,
  })
  return patchRun(quest, nextRun)
}

export function enterExplorationZone(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  if (run.machineState !== "EXPLORATION") {
    throw new Error("Not in exploration state")
  }
  if (run.explorationBeat != null) {
    return quest
  }
  return patchRun(quest, {
    ...run,
    ...initExplorationFields(),
  })
}

export function advanceExplorationBeat(
  quest: QuestContract,
  action: ExplorationAction,
  playerId: string
): QuestContract {
  const run = quest.dungeonRun!
  if (run.machineState !== "EXPLORATION") {
    throw new Error("Exploration advance only valid in EXPLORATION")
  }

  const withZone =
    run.explorationBeat == null
      ? patchRun(quest, { ...run, ...initExplorationFields() }).dungeonRun!
      : run

  const result = advanceExploration(withZone, action)
  eventBus.emit(GAME_EVENTS.EXPLORATION_BEAT_ADVANCED, {
    playerId,
    dungeonId: run.dungeon.id,
    beat: result.run.explorationBeat,
    action,
    progress: result.run.explorationProgress,
  })

  return patchRun(quest, {
    ...result.run,
    explorationSystemLine: result.systemLine,
  })
}

/** @deprecated Use engageSectorEncounter — kept for internal continuity */
export function beginDungeonSector(quest: QuestContract): QuestContract {
  return engageSectorEncounter(quest)
}

export function engageSectorEncounter(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  if (run.machineState === "PREPARATION") {
    throw new Error("Deploy the dungeon before entering a sector")
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

  const mounted = mountSectorEncounter(slot.type, String(run.currentEncounterIndex + 1))
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

function beginBossPhase(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const mounted = mountBossEncounter(run.bossPhase)
  const from = run.machineState === "REWARD" ? "REWARD" : "EXPLORATION"
  return patchRun(
    { ...quest, ...clearEncounterPayloads(), ...mounted },
    {
      ...run,
      machineState: transition(from, "BOSS"),
      activeType: "BOSS",
      explorationBeat: null,
    }
  )
}

export function completeDungeonSector(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const slot = run.dungeon.encounters[run.currentEncounterIndex]

  let updated = advanceDungeonObjective(quest)
  if (slot) {
    updated = markEncounterComplete(updated, slot.id)
  }

  const nextRun: DungeonRunContract = {
    ...updated.dungeonRun!,
    machineState: transition(run.machineState, "REWARD"),
    activeType: null,
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
  const bossPhases = run.dungeon.boss?.phases ?? 2

  if (nextPhase >= bossPhases) {
    const cleared = advanceDungeonObjective(quest)
    return patchRun(
      { ...cleared, ...clearEncounterPayloads() },
      {
        ...run,
        bossPhase: nextPhase,
        machineState: transition(run.machineState, "EXTRACTION"),
        activeType: null,
      }
    )
  }

  const mounted = mountBossEncounter(nextPhase)
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
  const allSectorsDone = run.dungeon.encounters.every((e) => e.completed)
  const mode = resolveDungeonGameMode(run)

  if (
    mode === "CORRUPTION_RUN" &&
    allSectorsDone &&
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

  if (allSectorsDone && run.machineState === "REWARD") {
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

export function finalizeDungeonExtraction(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const objectives = quest.objectives.map((o) => ({
    ...o,
    currentProgress: o.requiredProgress,
    completed: true,
  }))

  return patchRun(
    { ...quest, objectives, ...clearEncounterPayloads() },
    { ...run, machineState: "COMPLETE", activeType: null }
  )
}

export interface DungeonFailResult {
  quest: QuestContract
  penalties: PlayerPenaltyContract
}

export function failDungeonRun(
  quest: QuestContract,
  penalties: PlayerPenaltyContract,
  playerId: string
): DungeonFailResult {
  const run = quest.dungeonRun!
  eventBus.emit(GAME_EVENTS.DUNGEON_FAILED, {
    playerId,
    dungeonId: run.dungeon.id,
  })

  const failResult = failQuest(
    {
      ...quest,
      penalties: DUNGEON_CONFIG.DUNGEON_FAILURE_PENALTIES,
    },
    penalties,
    playerId
  )

  return {
    quest: patchRun(failResult.quest, {
      ...run,
      machineState: "FAILURE",
      activeType: null,
    }),
    penalties: failResult.penalties,
  }
}

export function registerEncounterFailure(
  quest: QuestContract,
  penalties?: PlayerPenaltyContract
): QuestContract {
  const run = quest.dungeonRun!
  const failures = run.encounterFailures + 1
  const updated = patchRun(quest, { ...run, encounterFailures: failures })
  const maxFailures = penalties
    ? maxDungeonEncounterFailures(penalties)
    : DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES

  if (failures >= maxFailures) {
    return updated
  }

  return updated
}

export function shouldFailDungeon(
  quest: QuestContract,
  penalties?: PlayerPenaltyContract
): boolean {
  const maxFailures = penalties
    ? maxDungeonEncounterFailures(penalties)
    : DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES
  return (quest.dungeonRun?.encounterFailures ?? 0) >= maxFailures
}

export function getDungeonBriefing(quest: QuestContract): string {
  const run = quest.dungeonRun
  if (!run) return quest.description
  const boss = run.dungeon.boss?.name ?? "Unknown"
  const sectors = run.dungeon.encounters.length
  return `${quest.description} · ${sectors} sectors · Boss: ${boss}`
}
