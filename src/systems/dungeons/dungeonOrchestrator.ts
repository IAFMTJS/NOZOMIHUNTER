import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import type {
  DungeonExtractionChoice,
  DungeonRunContract,
  ExplorationAction,
} from "@/contracts/dungeon-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { maxDungeonEncounterFailures } from "@/systems/penalties/penaltyGameplaySystem"
import { advanceObjective } from "@/systems/quests/questValidator"
import { failQuest } from "@/systems/quests/questOrchestrator"
import {
  clearEncounterPayloads,
  mountSectorEncounter,
  type MountContext,
} from "./dungeonEncounterFactory"
import { transition } from "./dungeonStateMachine"
import {
  advanceExploration,
  initExplorationFields,
  isPursuitCaught,
  isReadyToEngage,
} from "./explorationSystem"
import { resolveDungeonGameMode } from "@/systems/gameModes/gameModeSystem"
import { isDungeonV2Run, resolveBossPhaseCount } from "./dungeonV2Helpers"
import {
  allEncounterNodesComplete,
  chooseRouteExit,
  getCurrentNode,
  initRouteRun,
  isAtBossGate,
  isNodeCompleted,
  listRouteChoices,
  markNodeCompleted,
} from "./dungeonRouteSystem"
import {
  applyCorrectConsequence,
  applyGreedyRoute,
  applyWrongConsequence,
  initThreatState,
  shouldForceBossFromAwareness,
} from "./dungeonThreatSystem"
import { mountBossPhaseEncounter } from "./dungeonBossSystem"
import {
  scoreBossPhaseClear,
  scoreExtractionChoice,
  scoreSectorClear,
} from "./dungeonRewardSystem"
import { buildEntryBriefing } from "@/systems/presentation/dungeonRunPresentation"
import { masterEntryBriefing } from "@/systems/presentation/dungeonMasterPresentation"
import { DUNGEON_CONSEQUENCE_COPY } from "@/contracts/presentation-contract"
import {
  dialogueOnAwarenessTier,
  dialogueOnBossPhase,
  dialogueOnCorruptionBand,
  dialogueOnDeploy,
  dialogueOnExtraction,
  dialogueOnFailure,
  dialogueOnFirstMistake,
  dialogueOnPerfectClear,
  dialogueOnRouteChoice,
  dialogueOnStreak,
  isPerfectClearRun,
} from "./dungeonMasterDialogueSystem"
import {
  applyGateProtocolRoutePenalty,
  applyHungerOnStreak,
  applyHungerOnWrong,
  applyMasterThreatInit,
  damageBossIntegrityOnCorrect,
  restoreBossIntegrityOnWrong,
} from "./dungeonMasterRuleSystem"
import { getBossPhaseSpec } from "./dungeonBossSystem"

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

function mountContextFromRun(
  run: DungeonRunContract,
  playerLevel: number
): MountContext {
  const node = getCurrentNode(run)
  return {
    sectorLabel: node?.label ?? "Sector",
    playerLevel,
    selectedAction: run.selectedDungeonAction,
    dungeonRun: run,
  }
}

export function deployDungeon(
  quest: QuestContract,
  playerId: string
): QuestContract {
  const run = quest.dungeonRun!
  let nextRun: DungeonRunContract = {
    ...run,
    machineState: transition(run.machineState, "EXPLORATION"),
    ...initExplorationFields(),
  }

  if (isDungeonV2Run(run)) {
    nextRun = {
      ...nextRun,
      threat: run.threat ?? initThreatState(run.activeModifier),
      routeSelectPending: true,
      explorationProgress: 0,
      explorationBeat: null,
    }
    nextRun = applyMasterThreatInit(nextRun)
  }

  nextRun = dialogueOnDeploy(nextRun)

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

  if (isDungeonV2Run(run) && run.routeSelectPending) {
    throw new Error("Select a route before advancing the corridor.")
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

export function chooseDungeonRoute(
  quest: QuestContract,
  exitId: string,
  masteryScore = 0,
  playerLevel = 1
): QuestContract {
  const run = quest.dungeonRun!
  if (!isDungeonV2Run(run)) {
    throw new Error("Route choice only available in dungeon V2.")
  }

  const node = getCurrentNode(run)
  if (node?.danger === "high") {
    const greedy = applyGreedyRoute(run)
    quest = patchRun(quest, greedy)
  }

  const { run: routed, error } = chooseRouteExit(
    quest.dungeonRun!,
    exitId,
    masteryScore
  )
  if (error) throw new Error(error)

  const targetPreview = routed.routeGraph?.nodes[exitId]
  let routedWithRules = applyGateProtocolRoutePenalty(routed, targetPreview?.danger)
  routedWithRules = dialogueOnRouteChoice(routedWithRules)

  let updated = patchRun(quest, routedWithRules)
  const target = getCurrentNode(routedWithRules)
  if (!target) return updated

  if (target.type === "BOSS_GATE") {
    return beginBossPhase(updated)
  }

  if (target.type === "ENCOUNTER" && target.encounterType) {
    if (!isNodeCompleted(routed, target.id)) {
      return engageSectorEncounter(updated, playerLevel)
    }
    updated = patchRun(updated, { ...routed, routeSelectPending: true })
  }

  return updated
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

function beginBossPhase(quest: QuestContract): QuestContract {
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

export function applyExtractionChoice(
  quest: QuestContract,
  choice: DungeonExtractionChoice,
  playerLevel = 1
): QuestContract {
  const run = quest.dungeonRun!
  if (!isDungeonV2Run(run)) {
    throw new Error("Extraction choice only in dungeon V2.")
  }

  let nextRun = scoreExtractionChoice(
    {
      ...run,
      extractionChoicePending: false,
      pendingExtractionChoice: choice,
      lastConsequenceLine:
        choice === "EXTRACT_SAFE"
          ? DUNGEON_CONSEQUENCE_COPY.extractionSafe
          : DUNGEON_CONSEQUENCE_COPY.extractionPush,
    },
    choice === "PUSH_DEEPER"
  )
  nextRun = dialogueOnExtraction(nextRun)

  if (choice === "PUSH_DEEPER" && !run.pushDeepBonusClaimed) {
    const mounted = mountSectorEncounter("VOCAB", "Deep push bonus", {
      sectorLabel: "Bonus cache",
      playerLevel,
      wordCount: 2,
    })
    return patchRun(
      { ...quest, ...clearEncounterPayloads(), ...mounted },
      {
        ...nextRun,
        pushDeepBonusClaimed: true,
        machineState: "ENCOUNTER",
        activeType: "VOCAB",
      }
    )
  }

  return patchRun(quest, nextRun)
}

export function finalizeDungeonExtraction(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const objectives = quest.objectives.map((o) => ({
    ...o,
    currentProgress: o.requiredProgress,
    completed: true,
  }))

  let finalRun: DungeonRunContract = {
    ...run,
    machineState: "COMPLETE",
    activeType: null,
    extractionChoicePending: false,
  }
  if (isPerfectClearRun({ ...finalRun, encounterFailures: run.encounterFailures })) {
    finalRun = dialogueOnPerfectClear(finalRun)
  }

  return patchRun({ ...quest, objectives, ...clearEncounterPayloads() }, finalRun)
}

export function applyEncounterAnswerConsequence(
  quest: QuestContract,
  correct: boolean
): QuestContract {
  const run = quest.dungeonRun!
  if (!isDungeonV2Run(run)) return quest

  const streak = quest.vocabularyEncounter?.correctStreak ?? 0
  if (correct) {
    const { run: next } = applyCorrectConsequence(run, streak)
    let patched = damageBossIntegrityOnCorrect(next)
    patched = applyHungerOnStreak(patched, streak)
    patched = dialogueOnStreak(patched, streak)
    patched = dialogueOnAwarenessTier(patched)
    patched = dialogueOnCorruptionBand(patched)
    return patchRun(quest, patched)
  }

  const { run: nextAfterWrong, forceBoss } = applyWrongConsequence(run)
  let next = applyHungerOnWrong(nextAfterWrong)
  next = restoreBossIntegrityOnWrong(next)
  next = dialogueOnFirstMistake(next)
  next = dialogueOnAwarenessTier(next)
  next = dialogueOnCorruptionBand(next)
  let updated = patchRun(quest, next)
  if (forceBoss && updated.dungeonRun?.machineState !== "BOSS") {
    updated = beginBossPhase(updated)
  }
  return updated
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

  const failedRun = dialogueOnFailure({
    ...run,
    machineState: "FAILURE",
    activeType: null,
  })

  return {
    quest: patchRun(failResult.quest, failedRun),
    penalties: failResult.penalties,
  }
}

export function registerEncounterFailure(
  quest: QuestContract,
  penalties?: PlayerPenaltyContract
): QuestContract {
  const run = quest.dungeonRun!
  const failures = run.encounterFailures + 1
  let updated = patchRun(quest, { ...run, encounterFailures: failures })
  updated = applyEncounterAnswerConsequence(updated, false)

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
  if (isDungeonV2Run(run)) {
    return masterEntryBriefing(run, buildEntryBriefing(run, quest.description))
  }
  if (run.masterId || run.dungeon.masterId) {
    return masterEntryBriefing(run, quest.description)
  }
  const boss = run.dungeon.boss?.name ?? "Unknown"
  const sectors = run.dungeon.encounters.length
  return `${quest.description} · ${sectors} sectors · Boss: ${boss}`
}

export { listRouteChoices, initRouteRun, isDungeonV2Run }
