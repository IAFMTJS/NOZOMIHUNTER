import { applyListeningReplayPenalty } from "@/systems/dungeons/dungeonThreatSystem"
import { applySignalDecayOnReplay } from "@/systems/dungeons/dungeonMasterRuleSystem"
import { getDungeonQuest, persistDungeonQuest } from "./dungeonPersistence"

export async function applyDungeonListeningReplayPenalty(
  userId: string
): Promise<void> {
  const { quest } = getDungeonQuest()
  if (!quest?.dungeonRun) return
  let run = applyListeningReplayPenalty(quest.dungeonRun)
  run = applySignalDecayOnReplay(run)
  await persistDungeonQuest(userId, { ...quest, dungeonRun: run })
}
