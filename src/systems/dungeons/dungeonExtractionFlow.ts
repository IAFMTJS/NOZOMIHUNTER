import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonExtractionChoice } from "@/contracts/dungeon-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { DUNGEON_CONSEQUENCE_COPY } from "@/contracts/presentation-contract"
import { clearEncounterPayloads, mountSectorEncounter } from "./dungeonEncounterFactory"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import { scoreExtractionChoice } from "./dungeonRewardSystem"
import { dialogueOnExtraction, dialogueOnPerfectClear, isPerfectClearRun } from "./dungeonMasterDialogueSystem"
import { patchRun } from "./dungeonQuestPatch"

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
