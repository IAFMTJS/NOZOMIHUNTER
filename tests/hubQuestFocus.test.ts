import { describe, expect, it } from "vitest"
import { buildTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { resolveHubHuntQuest } from "@/features/hub/questReadyForHunt"
import type { QuestContract } from "@/contracts/quest-contract"

describe("resolveHubHuntQuest", () => {
  it("resolves training quests from activeQuests when not in regular list", () => {
    const training = buildTrainingQuest("SIGNAL_CALIBRATION", 5)
    const regular: QuestContract[] = []
    const active = [training]
    const resolved = resolveHubHuntQuest(regular, active, training.id)
    expect(resolved?.id).toBe(training.id)
    expect(resolved?.gameMode).toBe("SIGNAL_CALIBRATION")
  })
})
