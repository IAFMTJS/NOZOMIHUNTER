import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { mergeUnlocks } from "@/systems/progression/unlockSystem"

export const TUTORIAL_SYSTEM_UNLOCK = "system:tutorial:intro"

export function isTutorialComplete(player: PlayerContract): boolean {
  return player.progression.unlockedSystems.includes(TUTORIAL_SYSTEM_UNLOCK)
}

export function shouldAssignTutorialQuest(
  player: PlayerContract,
  activeQuests: QuestContract[]
): boolean {
  if (isTutorialComplete(player)) return false
  if (activeQuests.some((q) => q.isTutorial)) return false
  return activeQuests.length === 0
}

export function markTutorialComplete(
  progression: PlayerContract["progression"]
): PlayerContract["progression"] {
  return mergeUnlocks(progression, [TUTORIAL_SYSTEM_UNLOCK])
}

export const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Hunter Registration",
    body: "Your first contract is ready. Complete the vocabulary encounter to earn XP.",
  },
  {
    id: "encounter",
    title: "Word Hunt",
    body: "Read the kanji. Answer with romaji or English. Wrong answers build tension — too many failures end the quest.",
  },
  {
    id: "complete",
    title: "Claim Reward",
    body: "When all targets are cleared, complete the quest to level up and save progress.",
  },
] as const
