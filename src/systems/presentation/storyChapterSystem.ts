import type { QuestContract } from "@/contracts/quest-contract"
import {
  getQuestCatalogMeta,
  STORY_MISSION_PLACEHOLDERS,
  type StoryMissionPlaceholder,
} from "@/config/missionCatalogMetadata"
import { aggregateQuestProgress } from "@/systems/presentation/questPresentationSystem"
import { isQuestUnlocked } from "@/systems/quests/questUnlockSystem"

export type StoryQuestRow =
  | {
      kind: "active"
      quest: QuestContract
      locked: boolean
      missionIndex: number
    }
  | {
      kind: "placeholder"
      placeholder: StoryMissionPlaceholder
      locked: true
      missionIndex: number
    }

export interface StoryChapterView {
  chapterId: string
  chapterTitle: string
  missions: StoryQuestRow[]
  progressPercent: number
  currentMissionIndex: number
  totalMissions: number
}

export function buildStoryChapters(
  mainStoryQuests: QuestContract[],
  completedQuests: QuestContract[],
  completedIds: string[]
): StoryChapterView[] {
  const completedMain = completedQuests.filter(
    (q) => q.narrativeTier === "MAIN" || q.isTutorial
  )

  const chapterMap = new Map<string, StoryChapterView>()

  function ensureChapter(chapterId: string, chapterTitle: string) {
    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, {
        chapterId,
        chapterTitle,
        missions: [],
        progressPercent: 0,
        currentMissionIndex: 1,
        totalMissions: 0,
      })
    }
    return chapterMap.get(chapterId)!
  }

  for (const q of completedMain) {
    const meta = getQuestCatalogMeta(q)
    const chapter = ensureChapter(
      meta.chapterId ?? "ch-01",
      meta.chapterTitle ?? "Chapter 1"
    )
    chapter.missions.push({
      kind: "active",
      quest: q,
      locked: false,
      missionIndex: meta.missionIndex ?? chapter.missions.length + 1,
    })
  }

  for (const mainStory of mainStoryQuests) {
    const meta = getQuestCatalogMeta(mainStory)
    const chapter = ensureChapter(
      meta.chapterId ?? "ch-01",
      meta.chapterTitle ?? "Chapter 1"
    )
    chapter.missions.push({
      kind: "active",
      quest: mainStory,
      locked: !isQuestUnlocked(mainStory, completedIds),
      missionIndex: meta.missionIndex ?? chapter.missions.length + 1,
    })
  }

  for (const placeholder of STORY_MISSION_PLACEHOLDERS) {
    const chapter = ensureChapter(placeholder.chapterId, placeholder.chapterTitle)
    chapter.missions.push({
      kind: "placeholder",
      placeholder,
      locked: true,
      missionIndex: placeholder.missionIndex,
    })
  }

  for (const chapter of chapterMap.values()) {
    chapter.missions.sort((a, b) => a.missionIndex - b.missionIndex)
    chapter.totalMissions = chapter.missions.length

    let done = 0
    let currentIdx = 1
    for (const row of chapter.missions) {
      if (row.kind === "active") {
        const prog = aggregateQuestProgress(row.quest)
        if (prog.complete) done += 1
        else if (!row.locked) currentIdx = row.missionIndex
      }
    }
    chapter.currentMissionIndex = currentIdx
    chapter.progressPercent =
      chapter.totalMissions > 0
        ? Math.round((done / chapter.totalMissions) * 100)
        : 0
  }

  return [...chapterMap.values()].sort((a, b) =>
    a.chapterId.localeCompare(b.chapterId)
  )
}
