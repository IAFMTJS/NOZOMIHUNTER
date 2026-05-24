import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract, QuestRequestChannel } from "@/contracts/quest-contract"
import { SYSTEM_MESSAGE_POOLS } from "@/config/systemMessages"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { getNextDungeonForecast } from "@/systems/dungeons/dungeonForecastSystem"
import { synchronizationLabel } from "@/systems/synchronization/synchronizationSystem"

export interface SystemMessageContext {
  player: PlayerContract
  activeQuests: QuestContract[]
  /** Stable seed for daily rotation (e.g. player id + date) */
  seed: string
}

function pickFromPool(
  pool: readonly string[],
  seed: string
): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return pool[h % pool.length]!
}

export function selectChannelSystemMessage(
  context: SystemMessageContext,
  channel?: QuestRequestChannel
): string | null {
  if (channel === "daily") {
    return pickFromPool(
      SYSTEM_MESSAGE_POOLS.DAILY_MAINTENANCE,
      `${context.seed}:daily`
    )
  }
  if (channel === "side") {
    return pickFromPool(
      SYSTEM_MESSAGE_POOLS.SIDE_OPERATIONS,
      `${context.seed}:side`
    )
  }
  return selectSystemMessage(context)
}

export function selectSystemMessage(
  context: SystemMessageContext
): string | null {
  const { player, activeQuests, seed } = context
  const sync = player.synchronization
  const readiness = computeReadiness({ player })
  const forecast = getNextDungeonForecast(player, activeQuests)

  if (sync.atRisk) {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.WARNING, `${seed}:sync-risk`)
  }

  if (sync.status === "BROKEN") {
    return "Discipline chain broken. Redeploy to re-establish synchronization."
  }

  if (player.penalties.corruption >= 50) {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.WARNING, `${seed}:corruption`)
  }

  if (readiness.survivalBand === "CRITICAL" || readiness.survivalBand === "UNSTABLE") {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.WARNING, `${seed}:readiness`)
  }

  if (forecast && !forecast.isReady && forecast.access.status !== "blocked_active_run") {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.ANTICIPATION, `${seed}:gate`)
  }

  if (player.penalties.fatigue >= 40) {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.WARNING, `${seed}:fatigue`)
  }

  if (sync.status === "STABLE" && sync.chainDays >= 7) {
    return pickFromPool(SYSTEM_MESSAGE_POOLS.ACKNOWLEDGMENT, `${seed}:discipline`)
  }

  return pickFromPool(
    SYSTEM_MESSAGE_POOLS.OBSERVATION,
    `${seed}:${player.rank}`
  )
}

export function systemMessageSubline(player: PlayerContract): string {
  return `${player.identity.registryId} · ${synchronizationLabel(player.synchronization.status)}`
}
