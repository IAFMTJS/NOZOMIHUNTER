import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

export interface QuestCatalogDisplayMeta {
  titleJa?: string
  chapterId?: string
  chapterTitle?: string
  sortOrder?: number
  missionIndex?: number
  heroTheme?: DungeonTheme
  prerequisiteQuestId?: string | null
  linkedDungeonKey?: string
  flavorNarrative?: string
}

/** Locked story slots shown ahead of the active main contract. */
export interface StoryMissionPlaceholder {
  id: string
  missionIndex: number
  title: string
  titleJa: string
  chapterId: string
  chapterTitle: string
  rewardXp: number
  prerequisiteQuestId: string | null
}

const DEFAULT_CHAPTER = {
  chapterId: "ch-01",
  chapterTitle: "Chapter 1 · Underground Line",
}

const TYPE_TITLE_JA: Partial<Record<QuestContract["type"], string>> = {
  VOCABULARY: "語彙掃描",
  CONVERSATION: "交信任務",
  LISTENING: "聴取調査",
  SPEECH: "発声検証",
  DUNGEON: "ダンジョン侵入",
}

const OVERLAYS: Record<string, QuestCatalogDisplayMeta & { title?: string; description?: string }> =
  {}

export const STORY_MISSION_PLACEHOLDERS: StoryMissionPlaceholder[] = [
  {
    id: "story-placeholder-02",
    missionIndex: 2,
    title: "Investigate the Abandoned Subway",
    titleJa: "廃線地下鉄の調査",
    chapterId: DEFAULT_CHAPTER.chapterId,
    chapterTitle: DEFAULT_CHAPTER.chapterTitle,
    rewardXp: 320,
    prerequisiteQuestId: null,
  },
  {
    id: "story-placeholder-03",
    missionIndex: 3,
    title: "Decode the Neon Corridor",
    titleJa: "ネオン回廊の解読",
    chapterId: DEFAULT_CHAPTER.chapterId,
    chapterTitle: DEFAULT_CHAPTER.chapterTitle,
    rewardXp: 400,
    prerequisiteQuestId: "story-placeholder-02",
  },
]

export function getQuestCatalogMeta(quest: QuestContract): QuestCatalogDisplayMeta {
  const explicit = OVERLAYS[quest.id]
  const tier = quest.narrativeTier ?? (quest.isTutorial ? "MAIN" : undefined)

  const inferred: QuestCatalogDisplayMeta =
    tier === "MAIN" || quest.isTutorial
      ? {
          ...DEFAULT_CHAPTER,
          missionIndex: quest.isTutorial ? 1 : 2,
          titleJa: TYPE_TITLE_JA[quest.type],
          heroTheme:
            quest.type === "LISTENING" ? "ABANDONED_STATION" : "CYBER_TOKYO",
          linkedDungeonKey:
            quest.type === "LISTENING" ? "dungeon:neon-corridor" : undefined,
          flavorNarrative: quest.description,
        }
      : {
          missionIndex: undefined,
          titleJa: TYPE_TITLE_JA[quest.type],
        }

  return { ...inferred, ...explicit }
}

export function overlayCatalogMetadata(quest: QuestContract): QuestContract {
  const meta = OVERLAYS[quest.id]
  if (!meta) return quest
  return {
    ...quest,
    title: meta.title ?? quest.title,
    description: meta.description ?? quest.description,
  }
}
