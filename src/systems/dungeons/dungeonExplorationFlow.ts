import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ExplorationAction } from "@/contracts/dungeon-contract"
import { advanceExploration, initExplorationFields } from "./explorationSystem"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import { patchRun } from "./dungeonQuestPatch"

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
