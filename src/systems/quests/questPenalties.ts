import type { QuestPenaltyContract } from "@/contracts/quest-contract"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"

export function applyQuestPenalties(
  current: PlayerPenaltyContract,
  penalties?: QuestPenaltyContract
): PlayerPenaltyContract {
  if (!penalties) return current

  return {
    corruption: current.corruption + (penalties.corruption ?? 0),
    fatigue: current.fatigue + (penalties.fatigue ?? 0),
    xpDebt: current.xpDebt + (penalties.xpDebt ?? 0),
  }
}
