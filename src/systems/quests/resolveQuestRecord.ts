import type { QuestContract } from "@/contracts/quest-contract"

interface ResolveQuestRecordInput {
  questId: string
  regularQuests: QuestContract[]
  activeQuests: QuestContract[]
  completedQuests?: QuestContract[]
}

/**
 * Canonical quest lookup for contract detail views.
 * Supports active/regular quests and optional completed snapshots.
 */
export function resolveQuestRecord({
  questId,
  regularQuests,
  activeQuests,
  completedQuests = [],
}: ResolveQuestRecordInput): QuestContract | null {
  return (
    regularQuests.find((q) => q.id === questId) ??
    activeQuests.find((q) => q.id === questId) ??
    completedQuests.find((q) => q.id === questId) ??
    null
  )
}
