import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonTheme } from "@/contracts/dungeon-contract"
import { listSeasonStoryMissions } from "@/systems/content/seasonContentLoader"

export interface QuestCatalogDisplayMeta {
  title?: string
  description?: string
  titleJa?: string
  chapterId?: string
  chapterTitle?: string
  sortOrder?: number
  missionIndex?: number
  heroTheme?: DungeonTheme
  heroAssetKey?: string
  prerequisiteQuestId?: string | null
  linkedDungeonKey?: string
  flavorNarrative?: string
}

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

export const CHAPTER_TITLES: Record<string, string> = {
  "ch-01": "Chapter 1 · Lost Alphabet",
  "ch-02": "Chapter 2 · Silent Signals",
  "ch-03": "Chapter 3 · Broken Records",
  "ch-04": "Chapter 4 · Forgotten Horizon",
}

const CHAPTER_HERO_KEYS: Record<string, string> = {
  "ch-01": "hero.contract.file",
  "ch-02": "hero.dungeon.entry",
  "ch-03": "hero.training.priority",
  "ch-04": "hero.world.map",
}

const CHAPTER_THEMES: Record<string, DungeonTheme> = {
  "ch-01": "CYBER_TOKYO",
  "ch-02": "ABANDONED_STATION",
  "ch-03": "SHADOW_ARCHIVE",
  "ch-04": "ABYSS_CORE",
}

const TYPE_TITLE_JA: Partial<Record<QuestContract["type"], string>> = {
  VOCABULARY: "語彙掃描",
  CONVERSATION: "交信任務",
  LISTENING: "聴取調査",
  SPEECH: "発声検証",
  DUNGEON: "ダンジョン侵入",
}

function buildOverlays(): Record<
  string,
  QuestCatalogDisplayMeta & { title?: string; description?: string }
> {
  const overlays: Record<
    string,
    QuestCatalogDisplayMeta & { title?: string; description?: string }
  > = {}
  for (const m of listSeasonStoryMissions()) {
    const ch = m.chapterId
    overlays[`${m.id}-`] = {}
    overlays[m.id] = {
      chapterId: ch,
      chapterTitle: CHAPTER_TITLES[ch] ?? ch,
      missionIndex: m.missionIndex,
      titleJa: m.titleJa,
      heroTheme: CHAPTER_THEMES[ch],
      heroAssetKey: CHAPTER_HERO_KEYS[ch],
      linkedDungeonKey: m.template.linkedDungeonKey,
      flavorNarrative: m.template.description,
      title: m.title,
      description: m.template.description,
    }
    const prefixedId = `${m.id}-`
    overlays[prefixedId] = overlays[m.id]
  }
  return overlays
}

const OVERLAYS = buildOverlays()

export function overlayForQuestId(questId: string): QuestCatalogDisplayMeta | undefined {
  const baseId = questId.replace(/-[0-9a-f-]{36}$/i, "").replace(/-guest.*$/i, "")
  return OVERLAYS[questId] ?? OVERLAYS[baseId]
}

/** Locked story slots for chapter UI — missions not yet active. */
export const STORY_MISSION_PLACEHOLDERS: StoryMissionPlaceholder[] =
  listSeasonStoryMissions()
    .slice(1)
    .map((m) => ({
      id: m.id,
      missionIndex: m.missionIndex,
      title: m.title,
      titleJa: m.titleJa,
      chapterId: m.chapterId,
      chapterTitle: CHAPTER_TITLES[m.chapterId] ?? m.chapterId,
      rewardXp: 120 + m.missionIndex * 24,
      prerequisiteQuestId:
        m.template.prerequisiteBeatId != null
          ? listSeasonStoryMissions().find(
              (p) => p.storyBeatId === m.template.prerequisiteBeatId
            )?.id ?? null
          : null,
    }))

export function getQuestCatalogMeta(quest: QuestContract): QuestCatalogDisplayMeta {
  const explicit = overlayForQuestId(quest.id)
  const tier = quest.narrativeTier ?? (quest.isTutorial ? "MAIN" : undefined)

  const inferred: QuestCatalogDisplayMeta =
    tier === "MAIN" || quest.isTutorial
      ? {
          chapterId: quest.chapterId ?? "ch-01",
          chapterTitle:
            CHAPTER_TITLES[quest.chapterId ?? "ch-01"] ?? "Chapter 1",
          missionIndex: quest.missionIndex ?? (quest.isTutorial ? 1 : 2),
          titleJa: TYPE_TITLE_JA[quest.type],
          heroTheme:
            CHAPTER_THEMES[quest.chapterId ?? "ch-01"] ?? "CYBER_TOKYO",
          heroAssetKey:
            CHAPTER_HERO_KEYS[quest.chapterId ?? "ch-01"] ?? "hero.contract.file",
          linkedDungeonKey: quest.linkedDungeonKey,
          flavorNarrative: quest.briefing ?? quest.description,
        }
      : {
          missionIndex: undefined,
          titleJa: TYPE_TITLE_JA[quest.type],
        }

  return { ...inferred, ...explicit }
}

export function overlayCatalogMetadata(quest: QuestContract): QuestContract {
  const meta = overlayForQuestId(quest.id)
  if (!meta) return quest
  return {
    ...quest,
    title: meta.title ?? quest.title,
    description: meta.description ?? quest.description,
  }
}
