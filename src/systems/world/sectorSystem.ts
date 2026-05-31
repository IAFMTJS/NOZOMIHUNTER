import type { PlayerContract } from "@/contracts/player-contract"
import type {
  SectorCompletionMetrics,
  SectorDefinitionContract,
  SectorId,
  SectorState,
  SectorViewContract,
} from "@/contracts/sector-contract"
import {
  getSectorDefinition,
  listSectorDefinitions,
  sectorForDungeonKey,
} from "@/config/sectorRegistry"
import { resolveStoryProgress, isBeatCompleted } from "@/systems/narrative/storyProgressSystem"
import { listSeasonStoryMissions } from "@/systems/content/seasonContentLoader"

const SECTOR_UNLOCK_BEATS: Partial<Record<SectorId, string>> = {
  "sector-01": "beat-s01-001",
  "sector-02": "beat-s01-008",
  "sector-03": "beat-s01-016",
  "sector-04": "beat-s01-022",
}

function beatsForSector(sectorId: SectorId): string[] {
  return listSeasonStoryMissions()
    .filter((m) => m.template.linkedSectorId === sectorId)
    .map((m) => m.storyBeatId)
}

function completionMetrics(
  player: PlayerContract,
  sectorId: SectorId
): SectorCompletionMetrics {
  const progress = resolveStoryProgress(player)
  const beats = beatsForSector(sectorId)
  const storyBeatsCleared = beats.filter((b) =>
    progress.completedBeatIds.includes(b)
  ).length
  const archiveRecoveryPercent =
    beats.length > 0
      ? Math.round((storyBeatsCleared / beats.length) * 100)
      : 0
  const def = getSectorDefinition(sectorId)
  const bossClears = def?.primaryDungeonKeys.filter((k) =>
    player.progression.unlockedDungeons.includes(k)
  ).length ?? 0
  const contractCompletionPercent = archiveRecoveryPercent

  return {
    storyBeatsCleared,
    storyBeatsTotal: beats.length,
    archiveRecoveryPercent,
    bossClears,
    contractCompletionPercent,
  }
}

export function resolveSectorState(
  player: PlayerContract,
  sectorId: SectorId
): SectorState {
  const def = getSectorDefinition(sectorId)
  if (!def) return "LOCKED"

  const progress = resolveStoryProgress(player)
  const unlockBeat = SECTOR_UNLOCK_BEATS[sectorId]
  if (unlockBeat && !isBeatCompleted(progress, unlockBeat)) {
    return "LOCKED"
  }
  if (player.level < def.minLevel) return "LOCKED"

  const metrics = completionMetrics(player, sectorId)
  if (
    metrics.storyBeatsTotal > 0 &&
    metrics.storyBeatsCleared >= metrics.storyBeatsTotal
  ) {
    return "CLEARED"
  }

  const corruption = player.penalties.corruption
  if (corruption >= 90) return "CRITICAL"
  if (corruption >= 70) return "CORRUPTED"

  const activeDungeon = player.progression.unlockedDungeons.some((k) =>
    def.primaryDungeonKeys.includes(k)
  )
  if (activeDungeon || metrics.storyBeatsCleared > 0) return "ACTIVE"

  return "UNLOCKED"
}

export function buildSectorView(
  player: PlayerContract,
  sectorId: SectorId
): SectorViewContract | null {
  const def = getSectorDefinition(sectorId)
  if (!def) return null
  return {
    ...def,
    state: resolveSectorState(player, sectorId),
    completion: completionMetrics(player, sectorId),
  }
}

export function listSectorViews(player: PlayerContract): SectorViewContract[] {
  return listSectorDefinitions()
    .map((def) => buildSectorView(player, def.id))
    .filter((v): v is SectorViewContract => v != null)
}

export function resolveSectorForPlayer(
  player: PlayerContract,
  dungeonKey?: string
): SectorDefinitionContract | null {
  if (dungeonKey) {
    const byDungeon = sectorForDungeonKey(dungeonKey)
    if (byDungeon) return byDungeon
  }
  const progress = resolveStoryProgress(player)
  const currentBeat = progress.currentBeatId
  if (currentBeat) {
    const mission = listSeasonStoryMissions().find(
      (m) => m.storyBeatId === currentBeat
    )
    if (mission?.template.linkedSectorId) {
      return getSectorDefinition(mission.template.linkedSectorId)
    }
  }
  return getSectorDefinition("sector-01")
}
