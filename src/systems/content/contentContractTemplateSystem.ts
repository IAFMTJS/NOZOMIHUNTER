import type { QuestContract, QuestRequestChannel } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { hashSeed } from "@/systems/economy/shopRotationHash"
import { buildQuestRewards } from "@/systems/quests/questRewardFactory"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import { utcDateKey } from "@/systems/quests/dailyQuestSystem"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { createConversationEncounter } from "@/systems/quests/conversationEncounterSystem"
import seedContracts from "../../../content/seeds/content-contracts.json"

export interface ContentContractTemplate {
  id: string
  title: string
  channel: string
  template: {
    description: string
    briefing?: string
    type: "VOCABULARY" | "CONVERSATION" | "LISTENING"
    wordCount?: number
    narrativeTier?: "MAIN" | "SIDE" | "DAILY"
    gameMode?: GameModeId
    minimumLevel?: number
  }
}

let templateCache: ContentContractTemplate[] = seedContracts as ContentContractTemplate[]

export function setContentContractTemplates(rows: ContentContractTemplate[]): void {
  templateCache = rows
}

export function listContentContractTemplates(): ContentContractTemplate[] {
  return templateCache
}

export function pickContentContractTemplate(
  channel: QuestRequestChannel,
  playerId: string,
  date: string = utcDateKey()
): ContentContractTemplate | null {
  const pool = templateCache.filter((t) => t.channel === channel)
  if (pool.length === 0) return null
  const h = hashSeed(`${playerId}:${channel}:${date}`)
  return pool[h % pool.length] ?? pool[0]!
}

export function buildQuestFromContentTemplate(
  template: ContentContractTemplate,
  player: PlayerContract
): QuestContract {
  const t = template.template
  const tier =
    (t.narrativeTier as "MAIN" | "SIDE" | "DAILY" | undefined) ??
    (template.channel === "story" ? "MAIN" : template.channel === "daily" ? "DAILY" : "SIDE")
  const base: Omit<QuestContract, "id"> = {
    type: t.type,
    title: template.title,
    description: t.description,
    difficulty: player.level >= 20 ? "HARD" : player.level >= 10 ? "NORMAL" : "EASY",
    narrativeTier: tier,
    rewards: buildQuestRewards(player.level, tier === "DAILY" ? "DAILY" : tier),
    objectives: [
      {
        id: "primary",
        description: t.briefing ?? t.description,
        completed: false,
        currentProgress: 0,
        requiredProgress: 1,
      },
    ],
    requirements: t.minimumLevel
      ? [{ minimumLevel: t.minimumLevel }]
      : undefined,
  }

  let quest: QuestContract = {
    ...base,
    id: `${template.id}-${player.id}`,
  }

  if (t.type === "VOCABULARY") {
    quest = {
      ...quest,
      vocabularyEncounter: createVocabularyEncounter(t.wordCount ?? 3),
    }
  } else if (t.type === "CONVERSATION") {
    quest = {
      ...quest,
      conversationEncounter: createConversationEncounter("gate-check"),
    }
  }

  if (t.gameMode && t.gameMode !== "STANDARD") {
    quest = applyGameModeToQuest(quest, t.gameMode)
  }

  return attachVocabularyPreparation(quest)
}
