import type { PlayerContract } from "@/contracts/player-contract"
import { canSpendDiscipline } from "@/systems/progression/disciplineCurrencySystem"
import { spendDisciplineGuarded } from "@/services/supabase/economyRepository"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export const DISCIPLINE_SINK_COSTS = {
  RESEARCH_NODE: 12,
  COSMETIC_TITLE: 8,
} as const

export type DisciplineSinkId = keyof typeof DISCIPLINE_SINK_COSTS

export function disciplineSinkCost(sink: DisciplineSinkId): number {
  return DISCIPLINE_SINK_COSTS[sink]
}

export async function spendDisciplineAmount(
  player: PlayerContract,
  amount: number,
  sink: string
): Promise<PlayerContract> {
  if (!canSpendDiscipline(player, amount)) {
    throw new Error("Insufficient discipline")
  }
  await spendDisciplineGuarded(amount, sink)
  eventBus.emit(GAME_EVENTS.DISCIPLINE_SPENT, {
    playerId: player.id,
    amount,
    sink,
  })
  return {
    ...player,
    progression: {
      ...player.progression,
      discipline: player.progression.discipline - amount,
    },
  }
}

export async function spendDisciplineForSink(
  player: PlayerContract,
  sink: DisciplineSinkId
): Promise<PlayerContract> {
  const cost = disciplineSinkCost(sink)
  return spendDisciplineAmount(player, cost, sink)
}
