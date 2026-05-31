import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { StoryBeatId, StoryProgressContract } from "@/contracts/narrative-contract"
import {
  DEFAULT_STORY_PROGRESS,
  irisTrustTierFromScore,
} from "@/contracts/narrative-contract"

export function resolveStoryProgress(
  player: PlayerContract
): StoryProgressContract {
  return player.storyProgress ?? DEFAULT_STORY_PROGRESS()
}

export function isBeatCompleted(
  progress: StoryProgressContract,
  beatId: StoryBeatId
): boolean {
  return progress.completedBeatIds.includes(beatId)
}

export function canUnlockBeat(
  progress: StoryProgressContract,
  prerequisiteBeatId?: StoryBeatId | null
): boolean {
  if (!prerequisiteBeatId) return true
  return isBeatCompleted(progress, prerequisiteBeatId)
}

export function applyLocalStoryBeatComplete(
  player: PlayerContract,
  beatId: StoryBeatId,
  archiveUnlockId?: string
): PlayerContract {
  const prev = resolveStoryProgress(player)
  if (prev.completedBeatIds.includes(beatId)) return player

  const irisTrust = Math.min(100, prev.irisTrust + 5)
  const archiveUnlockedIds = archiveUnlockId
    ? [...new Set([...prev.archiveUnlockedIds, archiveUnlockId])]
    : prev.archiveUnlockedIds

  return {
    ...player,
    storyProgress: {
      ...prev,
      currentBeatId: beatId,
      completedBeatIds: [...prev.completedBeatIds, beatId],
      irisTrust,
      irisTrustTier: irisTrustTierFromScore(irisTrust),
      archiveUnlockedIds,
    },
  }
}

export function storyBeatFromQuest(quest: QuestContract): StoryBeatId | null {
  return quest.storyBeatId ?? null
}

export function mergeStoryProgressOnPlayer(
  player: PlayerContract,
  remote: StoryProgressContract | null
): PlayerContract {
  if (!remote) return player
  return { ...player, storyProgress: remote }
}
