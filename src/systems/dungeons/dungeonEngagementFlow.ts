import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
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
import {
  mountFromEncounterScript,
  resolveScriptForNode,
} from "@/systems/encounters/encounterScriptSystem"
import { resolveNodeEncounterContent } from "@/config/dungeonEncounterContentConfig"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"

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

function applySpecialRoomMount(
  quest: QuestContract,
  run: DungeonRunContract,
  kind: "STORY" | "RECOVERY" | "TREASURE",
  copy?: string
): QuestContract {
  const relief =
    kind === "RECOVERY"
      ? Math.max(0, (run.sectorCorruption ?? run.threat?.corruptionPressure ?? 0) - 8)
      : run.sectorCorruption
  const nextRun: DungeonRunContract = {
    ...run,
    machineState: transition(run.machineState, "ENCOUNTER"),
    activeType: null,
    explorationBeat: null,
    explorationProgress: 100,
    routeSelectPending: false,
    sectorCorruption: relief,
    explorationSystemLine:
      copy ??
      (kind === "RECOVERY"
        ? DUNGEON_CONFIG.RECOVERY_ROUTE.corruptionReliefCopy
        : kind === "TREASURE"
          ? "Relic cache stabilized — bonus extraction logged."
          : "Story beat — continue when ready."),
  }
  return patchRun({ ...quest, ...clearEncounterPayloads() }, nextRun)
}

function mountNodeEncounter(
  quest: QuestContract,
  run: DungeonRunContract,
  playerLevel: number
) {
  const node = getCurrentNode(run)!
  const ctx = mountContextFromRun(run, playerLevel)
  const content = resolveNodeEncounterContent(run.dungeon.id, node.id)
  const script = resolveScriptForNode(
    run.dungeon.id,
    node.id,
    node.encounterScriptId ?? content?.encounterScriptId
  )

  if (script) {
    const scriptMount = mountFromEncounterScript(script, {
      ...ctx,
      roomType: node.roomType ?? content?.roomType ?? script.roomType,
    })
    if (scriptMount.kind === "RECOVERY") {
      return applySpecialRoomMount(
        quest,
        run,
        "RECOVERY",
        scriptMount.storyCopy ?? scriptMount.briefing
      )
    }
    if (scriptMount.kind === "STORY") {
      return applySpecialRoomMount(
        quest,
        run,
        "STORY",
        scriptMount.storyCopy ?? node.storyRoomCopy
      )
    }
    if (scriptMount.kind === "TREASURE") {
      return applySpecialRoomMount(quest, run, "TREASURE", scriptMount.briefing)
    }
    if (scriptMount.payload) {
      let nextQuest: QuestContract = {
        ...patchRun(
          { ...quest, ...clearEncounterPayloads(), ...scriptMount.payload },
          {
            ...run,
            machineState: transition(run.machineState, "ENCOUNTER"),
            activeType: scriptMount.payload.activeType,
            explorationBeat: null,
            explorationProgress: 100,
            routeSelectPending: false,
          }
        ),
      }
      if (scriptMount.gameMode && scriptMount.gameMode !== "STANDARD") {
        nextQuest = applyGameModeToQuest(nextQuest, scriptMount.gameMode)
      }
      return nextQuest
    }
  }

  if (node.roomType === "RECOVERY") {
    return applySpecialRoomMount(quest, run, "RECOVERY", node.storyRoomCopy)
  }
  if (node.roomType === "STORY") {
    return applySpecialRoomMount(
      quest,
      run,
      "STORY",
      node.storyRoomCopy ?? "Story beat — continue when ready."
    )
  }
  if (node.roomType === "TREASURE") {
    return applySpecialRoomMount(quest, run, "TREASURE")
  }

  const mounted = mountSectorEncounter(
    node.encounterType!,
    node.label,
    {
      ...ctx,
      roomType: node.roomType ?? content?.roomType,
      gameMode: content?.gameMode,
    }
  )

  const encounterIndex = run.dungeon.encounters.findIndex(
    (e) => e.type === node.encounterType && !e.completed
  )

  let nextQuest: QuestContract = {
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

  if (content?.gameMode && content.gameMode !== "STANDARD") {
    nextQuest = applyGameModeToQuest(nextQuest, content.gameMode)
  }

  return nextQuest
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
  if (!node) {
    throw new Error("Current node has no breach encounter.")
  }

  if (node.type === "ROUTE") {
    throw new Error("Choose your next route before engaging.")
  }

  if (node.type !== "ENCOUNTER" && node.type !== "BOSS_GATE") {
    throw new Error("Current node has no breach encounter.")
  }

  if (node.type === "ENCOUNTER" && !node.encounterType && !node.roomType) {
    throw new Error("Current node has no breach encounter.")
  }

  if (isNodeCompleted(run, node.id)) {
    throw new Error("Sector already cleared — select next route.")
  }

  if (shouldForceBossFromAwareness(run)) {
    return beginBossPhase(quest)
  }

  return mountNodeEncounter(quest, run, playerLevel)
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
