import type { QuestContract } from "@/contracts/quest-contract"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"

function isConversationOnlyQuest(quest: QuestContract): boolean {
  if (quest.type !== "CONVERSATION") return false
  return (
    !quest.vocabularyEncounter &&
    !quest.listeningEncounter &&
    !quest.speechEncounter
  )
}

/** True when learner glosses should be masked by default (recall challenge). */
export function isRecallChallengeQuest(quest: QuestContract): boolean {
  if (isConversationOnlyQuest(quest)) return false
  if (quest.type === "VOCABULARY" || quest.type === "LISTENING" || quest.type === "SPEECH") {
    return true
  }
  if (quest.hidden) return true
  if (quest.vocabularyEncounter || quest.listeningEncounter || quest.speechEncounter) {
    return true
  }
  const mode = resolveQuestGameMode(quest)
  return mode !== "GHOST_INTERROGATION" && mode !== "DEEP_COVER" && mode !== "PANIC_CHANNEL"
}
