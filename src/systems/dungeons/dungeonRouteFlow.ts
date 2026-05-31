import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { transition } from "./dungeonStateMachine"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import {
  chooseRouteExit,
  getCurrentNode,
  isNodeCompleted,
} from "./dungeonRouteSystem"
import { applyGreedyRoute, applyCorruptionSpendIntelRoute, canSpendCorruptionForRoute, CORRUPTION_SPEND_ROUTE_COST } from "./dungeonThreatSystem"
import { dialogueOnRouteChoice } from "./dungeonMasterDialogueSystem"
import { applyGateProtocolRoutePenalty } from "./dungeonMasterRuleSystem"
import { patchRun } from "./dungeonQuestPatch"
import { beginBossPhase, engageSectorEncounter } from "./dungeonEngagementFlow"

export function chooseDungeonRoute(
  quest: QuestContract,
  exitId: string,
  masteryScore = 0,
  playerLevel = 1,
  playerPenalties?: PlayerPenaltyContract
): QuestContract {
  const run = quest.dungeonRun!
  if (!isDungeonV2Run(run)) {
    throw new Error("Route choice only available in dungeon V2.")
  }

  const node = getCurrentNode(run)
  if (node?.danger === "high") {
    let greedy = applyGreedyRoute(run)
    if (
      playerPenalties &&
      canSpendCorruptionForRoute(playerPenalties.corruption)
    ) {
      greedy = applyCorruptionSpendIntelRoute(greedy, CORRUPTION_SPEND_ROUTE_COST)
    }
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
    if (updated.dungeonRun?.machineState === "REWARD") {
      updated = patchRun(updated, {
        ...updated.dungeonRun,
        machineState: transition("REWARD", "EXPLORATION"),
      })
    }
    if (!isNodeCompleted(routed, target.id)) {
      return engageSectorEncounter(updated, playerLevel)
    }
    updated = patchRun(updated, { ...routed, routeSelectPending: true })
  }

  return updated
}
