import seedAchievements from "../../../content/seeds/content-achievements.json"

export interface ContentAchievementDef {
  id: string
  title: string
  description: string
  unlock_key?: string | null
}

let cache: ContentAchievementDef[] = seedAchievements as ContentAchievementDef[]

export function setContentAchievementsFromDb(rows: ContentAchievementDef[]): void {
  if (rows.length > 0) cache = rows
}

export function listContentAchievementDefinitions(): ContentAchievementDef[] {
  return cache
}
