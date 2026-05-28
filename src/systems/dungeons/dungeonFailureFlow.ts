import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import { maxDungeonEncounterFailures } from "@/systems/penalties/penaltyGameplaySystem"
import { failQuest } from "@/systems/quests/questOrchestrator"
import { dialogueOnFailure } from "./dungeonMasterDialogueSystem"
import { patchRun } from "./dungeonQuestPatch"
import { applyEncounterAnswerConsequence } from "./dungeonConsequenceFlow"

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
