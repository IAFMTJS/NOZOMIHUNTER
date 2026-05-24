import type { QuestContract } from "@/contracts/quest-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { createQuestInstanceId } from "@/systems/quests/questIds"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import { PENALTY_CONFIG } from "@/config/penaltyConfig"

export type TrainingMissionKind = GameModeId

const TRAINING_MODES: GameModeId[] = [
  "SIGNAL_CALIBRATION",
  "KANA_DASH",
  "KANJI_SURGERY",
  "MEMORY_CASCADE",
  "SHADOW_ECHO",
]

export function isTrainingGameMode(mode: GameModeId): boolean {
  return TRAINING_MODES.includes(mode)
}

export function buildTrainingQuest(
  kind: TrainingMissionKind,
  playerLevel: number
): QuestContract {
  const id = `training-${kind.toLowerCase()}-${createQuestInstanceId()}`
  const difficulty = "EASY"
  const rewards = { xp: 15 + Math.min(playerLevel * 3, 30) }

  const base: QuestContract = {
    id,
    type: "VOCABULARY",
    title: trainingTitle(kind),
    description: trainingDescription(kind),
    difficulty,
    rewards,
    penalties: PENALTY_CONFIG.TUTORIAL_QUEST_FAILURE,
    objectives: [
      {
        id: "obj-1",
        description: "Complete training objective",
        currentProgress: 0,
        requiredProgress: 1,
        completed: false,
      },
    ],
    hidden: true,
    gameMode: kind,
  }

  return applyGameModeToQuest(base, kind)
}

function trainingTitle(kind: GameModeId): string {
  switch (kind) {
    case "SIGNAL_CALIBRATION":
      return "Signal Calibration"
    case "KANJI_SURGERY":
      return "Kanji Surgery"
    case "MEMORY_CASCADE":
      return "Memory Cascade"
    case "SHADOW_ECHO":
      return "Shadow Echo"
    case "KANA_DASH":
      return "Kana Dash"
    default:
      return "Stabilization Training"
  }
}

function trainingDescription(kind: GameModeId): string {
  switch (kind) {
    case "SIGNAL_CALIBRATION":
      return "Audio reconstruction drill — safe channel practice."
    case "KANJI_SURGERY":
      return "Repair unstable kanji seals in the simulation bay."
    case "MEMORY_CASCADE":
      return "High-speed memory overload — identify intruder words."
    case "SHADOW_ECHO":
      return "Voice mimic drill — mirror operator pacing before signal decay."
    case "KANA_DASH":
      return "Rapid kana recognition — build combo chains under pressure."
    default:
      return "Repeatable training drill."
  }
}

export function isTrainingQuest(quest: QuestContract): boolean {
  return quest.id.startsWith("training-")
}

/** @deprecated use isTrainingGameMode */
export function legacyTrainingKindFromQuest(quest: QuestContract): "vocabulary" | "listening" | null {
  if (!isTrainingQuest(quest)) return null
  if (quest.gameMode === "SIGNAL_CALIBRATION") return "listening"
  if (quest.gameMode === "SHADOW_ECHO") return null
  return "vocabulary"
}
