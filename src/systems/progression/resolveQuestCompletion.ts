import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { PlayerProgressionContract } from "@/contracts/player-contract"
import type { QuestRewardContract } from "@/contracts/quest-contract"
import { mergeUnlocks } from "./unlockSystem"

function allUnlockKeys(progression: PlayerProgressionContract): Set<string> {
  return new Set([
    ...progression.unlockedSystems,
    ...progression.unlockedDungeons,
    ...progression.titles,
  ])
}

export function diffNewUnlocks(
  before: PlayerProgressionContract,
  after: PlayerProgressionContract
): string[] {
  const prev = allUnlockKeys(before)
  const added: string[] = []
  for (const key of [
    ...after.unlockedSystems,
    ...after.unlockedDungeons,
    ...after.titles,
  ]) {
    if (!prev.has(key)) added.push(key)
  }
  return added
}

export function resolveRewardProgression(
  current: PlayerProgressionContract,
  rewards: Pick<QuestRewardContract, "unlocks">
): { progression: PlayerProgressionContract; newUnlocks: string[] } {
  const progression = mergeUnlocks(current, rewards.unlocks)
  return {
    progression,
    newUnlocks: diffNewUnlocks(current, progression),
  }
}

export function emitUnlockGrants(
  playerId: string,
  newUnlocks: string[]
): void {
  if (newUnlocks.length === 0) return
  eventBus.emit(GAME_EVENTS.UNLOCK_GRANTED, {
    playerId,
    unlocks: newUnlocks,
  })
}
