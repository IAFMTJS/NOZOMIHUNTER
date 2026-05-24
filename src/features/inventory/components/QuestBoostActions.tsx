"use client"

import { Button } from "@/components/ui/Button"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { hasActiveBoost } from "@/systems/economy/boostSystem"
import { isBossEncounter } from "@/systems/economy/shopEffectSystem"
import { skipQuestObjective, freezeDungeonTimer } from "@/features/inventory/services/shopEffectActions"

interface QuestBoostActionsProps {
  player: PlayerContract
  userId: string
  quest?: QuestContract | null
  onAction?: () => void
}

export function QuestBoostActions({
  player,
  userId,
  quest,
  onAction,
}: QuestBoostActionsProps) {
  const canSkip =
    quest &&
    hasActiveBoost(player, "SKIP_TOKEN") &&
    !isBossEncounter(quest)

  const canFreeze =
    quest?.type === "DUNGEON" &&
    quest.dungeonRun &&
    hasActiveBoost(player, "TIME_FREEZE")

  if (!canSkip && !canFreeze) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {canSkip && quest && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void skipQuestObjective(userId, quest.id).then(() =>
              onAction?.()
            )
          }}
        >
          Skip objective
        </Button>
      )}
      {canFreeze && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void freezeDungeonTimer(userId).then(() => onAction?.())
          }}
        >
          Time freeze
        </Button>
      )}
    </div>
  )
}
