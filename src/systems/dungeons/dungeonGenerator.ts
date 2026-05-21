import type { DungeonContract } from "@/contracts/dungeon-contract"
import { FEATURE_FLAGS } from "@/config/features"

export function generateDungeon(
  playerLevel: number,
  theme: DungeonContract["theme"] = "CYBER_TOKYO"
): DungeonContract {
  if (!FEATURE_FLAGS.DYNAMIC_DUNGEONS) {
    throw new Error("Dungeons disabled")
  }

  const rank =
    playerLevel < 10
      ? "RANK_E"
      : playerLevel < 20
        ? "RANK_D"
        : "RANK_C"

  return {
    id: `dungeon-${Date.now()}`,
    name: "Neon Corridor",
    description: "A procedural corridor of language encounters.",
    theme,
    difficulty: rank,
    encounters: [
      { id: "e1", type: "VOCAB", difficulty: 1, completed: false },
      { id: "e2", type: "LISTENING", difficulty: 2, completed: false },
      { id: "e3", type: "SPEECH", difficulty: 3, completed: false },
    ],
    rewards: { xp: 150 + playerLevel * 10 },
    penalties: { corruption: 5, fatigue: 3 },
    multiplayerEnabled: false,
  }
}
