"use client"

import { useMemo } from "react"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { getNextDungeonForecast } from "@/systems/dungeons/dungeonForecastSystem"
import type { DungeonForecastContract } from "@/systems/dungeons/dungeonForecastSystem"

export function useHunterReadiness(
  player: PlayerContract | null,
  activeQuests: QuestContract[] = []
): {
  readiness: ReadinessResultContract | null
  forecast: DungeonForecastContract | null
} {
  const readiness = useMemo(
    () => (player ? computeReadiness({ player }) : null),
    [player]
  )

  const forecast = useMemo(
    () => (player ? getNextDungeonForecast(player, activeQuests) : null),
    [player, activeQuests]
  )

  return { readiness, forecast }
}
