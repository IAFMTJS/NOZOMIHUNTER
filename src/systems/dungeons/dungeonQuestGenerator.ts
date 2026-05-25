import type { QuestContract, QuestDifficulty } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { getDungeonDefinition, DUNGEON_CONFIG } from "@/config/dungeonConfig"
import { generateDungeon } from "./dungeonGenerator"
import { createQuestInstanceId } from "@/systems/quests/questIds"
import { rollDungeonModifiers, rollSingleModifier } from "./dungeonModifierSystem"
import { initPursuitDistance } from "./explorationSystem"
import { initRouteRun } from "./dungeonRouteSystem"
import { initThreatState } from "./dungeonThreatSystem"
import { applyMasterThreatInit } from "./dungeonMasterRuleSystem"
import { NEON_CORRIDOR_MODIFIER_POOL } from "@/config/neonCorridorV2Config"

function difficultyForLevel(level: number): QuestDifficulty {
  if (level < 5) return "EASY"
  if (level < 15) return "NORMAL"
  return "HARD"
}

export function totalDungeonSteps(encounterCount: number): number {
  return encounterCount + 1
}

export function generateDungeonQuest(
  playerLevel: number,
  dungeonKey: string
): QuestContract {
  const definition = getDungeonDefinition(dungeonKey)
  const dungeon = generateDungeon(playerLevel, definition)
  const steps = totalDungeonSteps(dungeon.encounters.length)

  const mode = definition.dungeonMode ?? "STANDARD"
  const modifierSeed = `${dungeonKey}:${Date.now()}`

  const isV2 = definition.runSchemaVersion === 2
  const v2Modifier = isV2
    ? rollSingleModifier(NEON_CORRIDOR_MODIFIER_POOL, modifierSeed)
    : undefined

  let run: DungeonRunContract = {
    dungeon,
    masterId: dungeon.masterId ?? definition.masterId,
    machineState: "PREPARATION",
    currentEncounterIndex: 0,
    activeType: null,
    encounterFailures: 0,
    bossPhase: 0,
    bossIntegrity: 100,
    dungeonMode: mode,
    modifiers:
      mode === "ROGUELIKE_SECTOR"
        ? rollDungeonModifiers(modifierSeed)
        : undefined,
    pursuitDistance: mode === "VOID_PURSUIT" ? initPursuitDistance() : undefined,
    endlessSectorCount: mode === "CORRUPTION_RUN" ? 0 : undefined,
    runSchemaVersion: isV2 ? 2 : undefined,
    activeModifier: v2Modifier,
    threat: isV2 ? initThreatState(v2Modifier) : undefined,
    runScore: isV2 ? 0 : undefined,
  }

  if (isV2 && definition.routeGraph) {
    run = initRouteRun(run, definition.routeGraph)
  }

  run = applyMasterThreatInit(run)

  return {
    id: createQuestInstanceId(),
    type: "DUNGEON",
    title: dungeon.name,
    description: dungeon.description,
    difficulty: difficultyForLevel(playerLevel),
    rewards: {
      xp: dungeon.rewards.xp,
      unlocks: dungeon.rewards.unlocks,
    },
    penalties: DUNGEON_CONFIG.DUNGEON_FAILURE_PENALTIES,
    dungeonRun: run,
    objectives: [
      {
        id: "obj-dungeon",
        description: "Clear all sectors and defeat the boss",
        currentProgress: 0,
        requiredProgress: steps,
        completed: false,
      },
    ],
    requirements: [{ minimumLevel: definition.minLevel }],
  }
}
