import type {
  PlayerContract,
  SynchronizationContract,
  SynchronizationStatus,
} from "@/contracts/player-contract"
import { SYNCHRONIZATION_CONFIG } from "@/config/synchronizationConfig"

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00Z`).getTime()
  const b = new Date(`${to}T12:00:00Z`).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function computeSynchronizationStatus(
  lastActiveDate: string | null,
  chainDays: number,
  today = todayIso()
): SynchronizationContract {
  if (!lastActiveDate) {
    return {
      chainDays: 0,
      lastActiveDate: null,
      status: "DORMANT",
      atRisk: false,
    }
  }

  const gap = daysBetween(lastActiveDate, today)

  if (gap === 0) {
    return {
      chainDays,
      lastActiveDate,
      status: "STABLE",
      atRisk: false,
    }
  }

  if (gap === 1) {
    return {
      chainDays,
      lastActiveDate,
      status: "AT_RISK",
      atRisk: true,
    }
  }

  return {
    chainDays: 0,
    lastActiveDate,
    status: "BROKEN",
    atRisk: false,
  }
}

export function applySynchronizationActivity(
  lastActiveDate: string | null,
  chainDays: number,
  today = todayIso()
): { lastActiveDate: string; chainDays: number } {
  if (!lastActiveDate) {
    return { lastActiveDate: today, chainDays: 1 }
  }

  const gap = daysBetween(lastActiveDate, today)

  if (gap === 0) {
    return { lastActiveDate, chainDays }
  }

  if (gap === 1) {
    return { lastActiveDate: today, chainDays: chainDays + 1 }
  }

  return { lastActiveDate: today, chainDays: 1 }
}

export function syncMilestoneUnlocks(chainDays: number): string[] {
  return SYNCHRONIZATION_CONFIG.MILESTONES.filter((m) => chainDays >= m.days).map(
    (m) => m.unlock
  )
}

export function mergeSyncMilestonesIntoPlayer(
  player: PlayerContract,
  chainDays: number
): PlayerContract {
  const unlocks = syncMilestoneUnlocks(chainDays)
  if (unlocks.length === 0) return player

  const titles = new Set(player.progression.titles)
  let changed = false
  for (const key of unlocks) {
    if (!titles.has(key)) {
      titles.add(key)
      changed = true
    }
  }

  if (!changed) return player

  return {
    ...player,
    progression: {
      ...player.progression,
      titles: [...titles],
    },
  }
}

export function synchronizationLabel(status: SynchronizationStatus): string {
  switch (status) {
    case "STABLE":
      return "Synchronization stable"
    case "AT_RISK":
      return "Synchronization at risk"
    case "BROKEN":
      return "Discipline chain broken"
    case "DORMANT":
      return "No synchronization record"
  }
}
