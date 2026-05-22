import { logSystemEvent } from "@/systems/logger/logger"
import { recordGameplayEvent } from "@/services/supabase/progressionRepository"
import type { GameEventType } from "@/systems/events/eventTypes"

interface AnalyticsEntry {
  event: GameEventType
  payload: unknown
  at: string
}

const buffer: AnalyticsEntry[] = []
const MAX_BUFFER = 200

export function recordAnalyticsEvent(
  event: GameEventType,
  payload: unknown
): void {
  const entry: AnalyticsEntry = {
    event,
    payload,
    at: new Date().toISOString(),
  }

  if (buffer.length >= MAX_BUFFER) {
    buffer.shift()
  }
  buffer.push(entry)

  logSystemEvent("analytics", event, payload)
  void recordGameplayEvent(event, payload)
}

export function getRecentAnalytics(limit = 50): AnalyticsEntry[] {
  return buffer.slice(-limit)
}

export function clearAnalyticsBuffer(): void {
  buffer.length = 0
}
