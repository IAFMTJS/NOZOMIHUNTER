import type { QuestContract } from "@/contracts/quest-contract"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { PENALTY_CONFIG } from "@/config/penaltyConfig"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"
import { createVocabularyEncounter } from "./vocabularyEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { buildQuestRewards } from "@/systems/quests/questRewardFactory"
import { hashSeed } from "@/systems/economy/shopRotationHash"

const DAILY_TEMPLATES = [
  {
    key: "stabilize",
    title: "Stabilization Sweep",
    description: "Contain unstable vocabulary signatures before they spread.",
    briefing:
      "Registry maintenance: verify flagged terms to restore sector stability.",
    wordCount: 3,
    type: "VOCABULARY" as const,
  },
  {
    key: "trace",
    title: "Corruption Trace",
    description: "Purge residual corruption traces from the lexicon buffer.",
    briefing:
      "Low-grade corruption detected. Clear trace glyphs to prevent escalation.",
    wordCount: 2,
    type: "VOCABULARY" as const,
  },
  {
    key: "signal",
    title: "Signal Drill",
    description: "Complete a short listening calibration sequence.",
    briefing:
      "Audio synchronization check. Decode incoming transmissions.",
    wordCount: 0,
    type: "LISTENING" as const,
  },
] as const

export function dailyQuestSeed(playerId: string, date: string): string {
  return `${playerId}:${date}`
}

export function dailyQuestInstanceId(playerId: string, date: string): string {
  return `daily-${playerId}-${date}`
}

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function isDailyQuestId(questId: string): boolean {
  return questId.startsWith("daily-")
}

function eligibleDailyTemplates(canListening: boolean) {
  return DAILY_TEMPLATES.filter(
    (t) => t.type !== "LISTENING" || canListening
  )
}

export function pickDailyTemplateIndex(
  playerId: string,
  date: string,
  canListening: boolean
): number {
  const eligible = eligibleDailyTemplates(canListening)
  if (eligible.length === 0) return 0
  const h = hashSeed(dailyQuestSeed(playerId, date))
  return h % eligible.length
}

export function generateDailyQuest(
  playerId: string,
  playerLevel: number,
  unlockedSystems: string[],
  date: string = utcDateKey()
): QuestContract {
  const canListening =
    playerLevel >= 2 && unlockedSystems.includes("system:listening")
  const eligible = eligibleDailyTemplates(canListening)
  const template =
    eligible[pickDailyTemplateIndex(playerId, date, canListening)] ??
    eligible[0] ??
    DAILY_TEMPLATES[0]

  const id = dailyQuestInstanceId(playerId, date)
  const difficulty = playerLevel < 5 ? "EASY" : "NORMAL"
  const rewards = buildQuestRewards(playerLevel, "DAILY")
  const penalties = PENALTY_CONFIG.DEFAULT_QUEST_FAILURE

  if (template.type === "LISTENING") {
    const fragmentCount = Math.min(
      2,
      LISTENING_QUEST_CONFIG.DEFAULT_FRAGMENT_COUNT
    )
    const encounter = createListeningEncounter(fragmentCount, template.briefing)
    return attachVocabularyPreparation({
      id,
      type: "LISTENING",
      title: template.title,
      description: template.description,
      difficulty,
      narrativeTier: "DAILY",
      rewards,
      penalties,
      listeningEncounter: encounter,
      objectives: [
        {
          id: "obj-1",
          description: "Complete listening calibration",
          currentProgress: 0,
          requiredProgress: fragmentCount,
          completed: false,
        },
      ],
      requirements: [{ minimumLevel: 1 }],
    })
  }

  const encounter = createVocabularyEncounter(
    template.wordCount || VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT
  )
  return attachVocabularyPreparation({
    id,
    type: "VOCABULARY",
    title: template.title,
    description: template.description,
    difficulty,
    narrativeTier: "DAILY",
    rewards,
    penalties,
    vocabularyEncounter: encounter,
    objectives: [
      {
        id: "obj-1",
        description: "Stabilize vocabulary targets",
        currentProgress: 0,
        requiredProgress: encounter.words.length,
        completed: false,
      },
    ],
    requirements: [{ minimumLevel: 1 }],
  })
}

export function findActiveDailyQuest(
  quests: QuestContract[],
  playerId: string,
  date: string = utcDateKey()
): QuestContract | null {
  const expectedId = dailyQuestInstanceId(playerId, date)
  return quests.find((q) => q.id === expectedId) ?? null
}
