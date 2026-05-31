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
import { createSpeechEncounter } from "@/systems/quests/speechEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { generateDungeonQuest } from "@/systems/dungeons/dungeonQuestGenerator"
import { resolveWordCount } from "@/systems/learning/encounterScaleSystem"
import { mergeSeasonStoryIntoTemplates } from "@/systems/content/seasonContentLoader"
import seedContracts from "../../../content/seeds/content-contracts.json"

export interface ContentContractTemplate {
  id: string
  title: string
  channel: string
  template: {
    description: string
    briefing?: string
    type: "VOCABULARY" | "CONVERSATION" | "LISTENING" | "SPEECH" | "DUNGEON"
    wordCount?: number
    narrativeTier?: "MAIN" | "SIDE" | "DAILY"
    gameMode?: GameModeId
    minimumLevel?: number
    seasonId?: string
    chapterId?: string
    missionIndex?: number
    storyBeatId?: string
    prerequisiteBeatId?: string
    archiveUnlockId?: string
    linkedSectorId?: string
    linkedDungeonKey?: string
    encounterScriptId?: string
    scenarioId?: string
    sector?: string
    learning_focus?: string
    boss_connection?: string | null
  }
}

let templateCache: ContentContractTemplate[] = mergeSeasonStoryIntoTemplates(
  seedContracts as ContentContractTemplate[]
)

export function setContentContractTemplates(rows: ContentContractTemplate[]): void {
  templateCache = mergeSeasonStoryIntoTemplates(rows)
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

function narrativeFields(t: ContentContractTemplate["template"]): Partial<QuestContract> {
  return {
    seasonId: t.seasonId,
    chapterId: t.chapterId,
    missionIndex: t.missionIndex,
    storyBeatId: t.storyBeatId,
    prerequisiteBeatId: t.prerequisiteBeatId,
    archiveUnlockId: t.archiveUnlockId,
    linkedSectorId: t.linkedSectorId,
    linkedDungeonKey: t.linkedDungeonKey,
    encounterScriptId: t.encounterScriptId,
    scenarioId: t.scenarioId,
    briefing: t.briefing,
  }
}

export function buildQuestFromContentTemplate(
  template: ContentContractTemplate,
  player: PlayerContract
): QuestContract {
  const t = template.template
  const tier =
    (t.narrativeTier as "MAIN" | "SIDE" | "DAILY" | undefined) ??
    (template.channel === "story" ? "MAIN" : template.channel === "daily" ? "DAILY" : "SIDE")

  const wordCount = resolveWordCount({
    context: tier === "DAILY" ? "daily" : tier === "MAIN" ? "story" : "quest",
    playerLevel: player.level,
    explicit: t.wordCount,
  })

  const base: Omit<QuestContract, "id"> = {
    type: t.type === "DUNGEON" ? "DUNGEON" : t.type,
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
    ...narrativeFields(t),
  }

  let quest: QuestContract = {
    ...base,
    id: `${template.id}-${player.id}`,
  }

  if (t.type === "VOCABULARY") {
    quest = {
      ...quest,
      vocabularyEncounter: createVocabularyEncounter(wordCount, t.linkedSectorId),
    }
  } else if (t.type === "CONVERSATION") {
    quest = {
      ...quest,
      conversationEncounter: createConversationEncounter(
        t.scenarioId ?? "gate-check"
      ),
    }
  } else if (t.type === "LISTENING") {
    const fragments = resolveWordCount({
      context: "listening",
      playerLevel: player.level,
      explicit: t.wordCount,
    })
    quest = {
      ...quest,
      listeningEncounter: createListeningEncounter(
        fragments,
        t.briefing ?? t.description
      ),
    }
  } else if (t.type === "SPEECH") {
    quest = {
      ...quest,
      speechEncounter: createSpeechEncounter(t.scenarioId ?? "field-relay"),
    }
  } else if (t.type === "DUNGEON" && t.linkedDungeonKey) {
    quest = {
      ...generateDungeonQuest(player.level, t.linkedDungeonKey),
      ...quest,
      id: `${template.id}-${player.id}`,
      narrativeTier: tier,
      ...narrativeFields(t),
    }
  }

  if (t.gameMode && t.gameMode !== "STANDARD") {
    quest = applyGameModeToQuest(quest, t.gameMode)
  }

  return attachVocabularyPreparation(quest)
}
