/** Record gameplay analytics with optional game mode context. */
import type { GameEventType } from "@/systems/events/eventTypes"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { recordAnalyticsEvent } from "@/systems/analytics/analyticsSystem"

export function recordGameModeAnalytics(
  event: GameEventType,
  gameMode: GameModeId | undefined,
  payload: Record<string, unknown> = {}
): void {
  recordAnalyticsEvent(event, {
    ...payload,
    game_mode: gameMode ?? "STANDARD",
  })
}
