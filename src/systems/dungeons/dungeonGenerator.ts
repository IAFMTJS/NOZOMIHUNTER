import type {
  DungeonContract,
  DungeonDifficulty,
} from "@/contracts/dungeon-contract"
import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import { FEATURE_FLAGS } from "@/config/features"

function rankForLevel(level: number): DungeonDifficulty {
  if (level < 10) return "RANK_E"
  if (level < 20) return "RANK_D"
  if (level < 30) return "RANK_C"
  return "RANK_B"
}

export function generateDungeon(
  playerLevel: number,
  definition: DungeonDefinitionConfig
): DungeonContract {
  if (!FEATURE_FLAGS.DYNAMIC_DUNGEONS) {
    throw new Error("Dungeons disabled")
  }

  const rank = rankForLevel(playerLevel)
  const xpBonus = playerLevel * 8

  return {
    id: `dungeon-${definition.key}-${Date.now()}`,
    name: definition.name,
    description: definition.description,
    theme: definition.theme,
    difficulty: rank,
    encounters: definition.encounterPlan.map((slot) => ({
      id: slot.id,
      type: slot.type,
      difficulty: slot.difficulty,
      completed: false,
    })),
    boss: {
      id: `boss-${definition.key}`,
      name: definition.bossName,
      phases: definition.bossPhaseSpecs?.length ?? 2,
      phaseSpecs: definition.bossPhaseSpecs,
      speechDifficulty: Math.min(5, 2 + Math.floor(playerLevel / 5)),
      grammarDifficulty: Math.min(5, 1 + Math.floor(playerLevel / 6)),
    },
    rewards: {
      xp: definition.rewardXpBase + xpBonus,
      credits: Math.floor((definition.rewardXpBase + xpBonus) / 5),
      items: [
        { itemKey: "shadow-shard", quantity: 2 },
        { itemKey: "signal-cache", quantity: 1 },
      ],
      unlocks: definition.unlocks,
    },
    penalties: { corruption: 5, fatigue: 4 },
    multiplayerEnabled: false,
  }
}
