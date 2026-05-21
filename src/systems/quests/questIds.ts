/** Unique quest instance id (not the catalog `quests` table id). */
export function createQuestInstanceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `quest-${crypto.randomUUID()}`
  }
  return `quest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
