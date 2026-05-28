import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { transition } from "./dungeonStateMachine"
import { initExplorationFields } from "./explorationSystem"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import { initThreatState } from "./dungeonThreatSystem"
import { dialogueOnDeploy } from "./dungeonMasterDialogueSystem"
import { applyMasterThreatInit } from "./dungeonMasterRuleSystem"
import { patchRun } from "./dungeonQuestPatch"

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
