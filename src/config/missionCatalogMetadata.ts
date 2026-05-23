import type { QuestContract } from "@/contracts/quest-contract"

/** Display-only overlays for generated contract titles. */
const OVERLAYS: Record<string, { title?: string; description?: string }> = {}

export function overlayCatalogMetadata(quest: QuestContract): QuestContract {
  const meta = OVERLAYS[quest.id]
  if (!meta) return quest
  return {
    ...quest,
    title: meta.title ?? quest.title,
    description: meta.description ?? quest.description,
  }
}
