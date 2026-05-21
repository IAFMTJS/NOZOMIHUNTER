import type { QuestContract } from "@/contracts/quest-contract"

/** Keep one quest per snapshot id (latest row wins when hydrating duplicates). */
export function dedupeActiveQuests(quests: QuestContract[]): QuestContract[] {
  const byId = new Map<string, QuestContract>()
  for (const quest of quests) {
    byId.set(quest.id, quest)
  }
  return [...byId.values()]
}
