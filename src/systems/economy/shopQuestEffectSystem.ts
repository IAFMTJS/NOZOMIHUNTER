import type { QuestContract } from "@/contracts/quest-contract"
import { advanceObjective } from "@/systems/quests/questValidator"
import { repairQuestSnapshot } from "@/systems/quests/questEncounterRepair"
import { clearEncounterPayloads } from "@/systems/dungeons/dungeonEncounterFactory"
import { transition } from "@/systems/dungeons/dungeonStateMachine"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { isBossEncounter } from "@/systems/economy/shopEffectSystem"

export function resetQuestForRetry(quest: QuestContract): QuestContract {
  const objectives = quest.objectives.map((o) => ({
    ...o,
    currentProgress: 0,
    completed: false,
  }))

  let next: QuestContract = {
    ...quest,
    objectives,
    vocabularyEncounter: quest.vocabularyEncounter
      ? {
          ...quest.vocabularyEncounter,
          currentIndex: 0,
          wrongAttempts: 0,
        }
      : undefined,
    speechEncounter: quest.speechEncounter
      ? {
          ...quest.speechEncounter,
          currentIndex: 0,
          wrongAttempts: 0,
        }
      : undefined,
    listeningEncounter: quest.listeningEncounter
      ? {
          ...quest.listeningEncounter,
          currentIndex: 0,
          wrongAttempts: 0,
        }
      : undefined,
    conversationEncounter: quest.conversationEncounter
      ? {
          ...quest.conversationEncounter,
          successfulExchanges: 0,
          wrongTurns: 0,
        }
      : undefined,
  }

  if (next.dungeonRun) {
    next = {
      ...next,
      dungeonRun: resetDungeonRun(next.dungeonRun),
      ...clearEncounterPayloads(),
    }
  }

  return repairQuestSnapshot(next)
}

function resetDungeonRun(run: DungeonRunContract): DungeonRunContract {
  return {
    ...run,
    machineState: "PREPARATION",
    currentEncounterIndex: 0,
    activeType: null,
    encounterFailures: 0,
    bossPhase: 0,
    explorationProgress: 0,
    explorationBeat: null,
    sectorIntelRevealed: false,
    runStartedAt: undefined,
    timeLimitMs: undefined,
    frozenTimeMs: 0,
    frozenUntil: null,
  }
}

export function skipCurrentObjective(quest: QuestContract): QuestContract {
  if (isBossEncounter(quest)) {
    throw new Error("Cannot skip boss encounters")
  }

  const target = quest.objectives.find((o) => !o.hidden && !o.completed)
  if (!target) {
    throw new Error("No skippable objective")
  }

  const remaining = target.requiredProgress - target.currentProgress
  let next: QuestContract = {
    ...quest,
    objectives: advanceObjective(quest.objectives, target.id, remaining),
  }

  if (next.vocabularyEncounter) {
    const enc = next.vocabularyEncounter
    next = {
      ...next,
      vocabularyEncounter: {
        ...enc,
        currentIndex: enc.words.length,
        wrongAttempts: 0,
      },
    }
  }

  if (next.speechEncounter) {
    const enc = next.speechEncounter
    next = {
      ...next,
      speechEncounter: {
        ...enc,
        currentIndex: enc.phrases.length,
        wrongAttempts: 0,
      },
    }
  }

  /* Listening objectives cannot be skipped — handled in questLifecycle */

  if (next.dungeonRun && next.dungeonRun.machineState === "ENCOUNTER") {
    next = skipDungeonEncounter(next)
  }

  return next
}

function skipDungeonEncounter(quest: QuestContract): QuestContract {
  const run = quest.dungeonRun!
  const encounterId =
    run.dungeon.encounters[run.currentEncounterIndex]?.id ?? "sector"
  const encounters = run.dungeon.encounters.map((e) =>
    e.id === encounterId ? { ...e, completed: true } : e
  )
  return {
    ...quest,
    ...clearEncounterPayloads(),
    dungeonRun: {
      ...run,
      dungeon: { ...run.dungeon, encounters },
      machineState: transition(run.machineState, "REWARD"),
      activeType: null,
    },
  }
}
