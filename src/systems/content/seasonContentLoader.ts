import type { ContentContractTemplate } from "@/systems/content/contentContractTemplateSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import type { StoryBeatId } from "@/contracts/narrative-contract"
import { resolveStoryProgress, canUnlockBeat } from "@/systems/narrative/storyProgressSystem"
import seasonStory from "../../../content/seasons/season-01-broken-signal/story-missions.json"
import sideContracts from "../../../content/seasons/season-01-broken-signal/side-missions.json"

export interface SeasonStoryMission {
  id: string
  storyBeatId: StoryBeatId
  missionIndex: number
  chapterId: string
  title: string
  titleJa: string
  template: ContentContractTemplate["template"]
}

export interface SeasonStoryPack {
  seasonId: string
  missions: SeasonStoryMission[]
}

const STORY_PACK = seasonStory as SeasonStoryPack
const SIDE_PACK = (sideContracts as { missions: ContentContractTemplate[] }).missions ?? []

export function listSeasonStoryMissions(): SeasonStoryMission[] {
  return STORY_PACK.missions
}

export function listSideMissionTemplates(): ContentContractTemplate[] {
  return SIDE_PACK
}

export function getStoryMissionById(id: string): SeasonStoryMission | undefined {
  return STORY_PACK.missions.find((m) => m.id === id)
}

export function getNextStoryMission(
  player: PlayerContract
): SeasonStoryMission | null {
  const progress = resolveStoryProgress(player)
  for (const mission of STORY_PACK.missions) {
    const beatDone = progress.completedBeatIds.includes(mission.storyBeatId)
    if (beatDone) continue
    const pre = mission.template.prerequisiteBeatId as StoryBeatId | undefined
    if (!canUnlockBeat(progress, pre ?? null)) continue
    if (
      mission.template.minimumLevel != null &&
      player.level < mission.template.minimumLevel
    ) {
      continue
    }
    return mission
  }
  return null
}

export function seasonStoryMissionToTemplate(
  mission: SeasonStoryMission
): ContentContractTemplate {
  return {
    id: mission.id,
    title: mission.title,
    channel: "story",
    template: mission.template,
  }
}

export function mergeSeasonStoryIntoTemplates(
  existing: ContentContractTemplate[]
): ContentContractTemplate[] {
  const storyIds = new Set(STORY_PACK.missions.map((m) => m.id))
  const filtered = existing.filter(
    (t) => t.channel !== "story" || !/^Main arc \d+$/i.test(t.title)
  )
  const nonStory = filtered.filter((t) => t.channel !== "story" || !storyIds.has(t.id))
  const seasonStoryTemplates = STORY_PACK.missions.map(seasonStoryMissionToTemplate)
  return [...nonStory, ...seasonStoryTemplates, ...SIDE_PACK]
}
