import type { GameEventType } from "@/systems/events/eventTypes"

export interface RecordLine {
  id: string
  at: string
  headline: string
  detail?: string
  tone: "neutral" | "success" | "danger" | "accent"
}

const EVENT_HEADLINES: Partial<Record<GameEventType, string>> = {
  QUEST_COMPLETED: "Contract cleared",
  QUEST_FAILED: "Contract failed",
  DUNGEON_COMPLETED: "Sector extracted",
  DUNGEON_FAILED: "Sector breach failed",
  XP_GAINED: "Extraction registered",
  LEVEL_UP: "Level advancement",
  RANK_UP: "Rank promotion",
  UNLOCK_GRANTED: "System unlock",
  WORD_BREWED: "Threat indexed",
  REWARDS_PENDING: "Rewards staged",
}

export function formatGameplayRecord(
  id: string,
  eventType: string,
  payload: Record<string, unknown>,
  createdAt: string
): RecordLine {
  const headline =
    EVENT_HEADLINES[eventType as GameEventType] ?? eventType.replace(/_/g, " ")

  const xp =
    typeof payload.xpGained === "number"
      ? payload.xpGained
      : typeof payload.xp === "number"
        ? payload.xp
        : null

  const questId =
    typeof payload.questId === "string" ? payload.questId : undefined
  const dungeonId =
    typeof payload.dungeonId === "string" ? payload.dungeonId : undefined

  let detail: string | undefined
  if (xp != null && xp > 0) detail = `+${xp} XP`
  if (questId) detail = [detail, `Contract ${questId.slice(0, 8)}`].filter(Boolean).join(" · ")
  if (dungeonId) detail = [detail, `Sector ${dungeonId.replace(/^dungeon:/, "")}`].filter(Boolean).join(" · ")

  const tone: RecordLine["tone"] =
    eventType.includes("FAILED") || eventType.includes("FAIL")
      ? "danger"
      : eventType.includes("COMPLETED") ||
          eventType === "LEVEL_UP" ||
          eventType === "RANK_UP"
        ? "success"
        : eventType === "UNLOCK_GRANTED"
          ? "accent"
          : "neutral"

  return { id, at: createdAt, headline, detail, tone }
}

export function formatCompletedContractRecord(
  id: string,
  title: string,
  completedAt: string,
  xp?: number
): RecordLine {
  return {
    id,
    at: completedAt,
    headline: "Contract archived",
    detail: [title, xp != null && xp > 0 ? `+${xp} XP` : null]
      .filter(Boolean)
      .join(" · "),
    tone: "success",
  }
}
