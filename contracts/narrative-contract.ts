export type SeasonId = string
export type ChapterId = string
export type StoryBeatId = string
export type ArchiveUnlockId = string

export type IrisTrustTier =
  | "UNKNOWN"
  | "OBSERVING"
  | "COOPERATIVE"
  | "TRUSTED"
  | "CONFIDANT"

export type FactionId = "hunters" | "keepers" | "corrupted" | "lost-ones"

export type FactionRep = Partial<Record<FactionId, number>>

export interface StoryFlagSet {
  [key: string]: boolean | string | number
}

export interface StoryProgressContract {
  seasonId: SeasonId
  currentBeatId: StoryBeatId | null
  completedBeatIds: StoryBeatId[]
  storyFlags: StoryFlagSet
  irisTrust: number
  irisTrustTier: IrisTrustTier
  factionRep: FactionRep
  archiveUnlockedIds: ArchiveUnlockId[]
  updatedAt?: string
}

export function irisTrustTierFromScore(trust: number): IrisTrustTier {
  if (trust >= 80) return "CONFIDANT"
  if (trust >= 60) return "TRUSTED"
  if (trust >= 40) return "COOPERATIVE"
  if (trust >= 20) return "OBSERVING"
  return "UNKNOWN"
}

export const DEFAULT_STORY_PROGRESS = (
  seasonId: SeasonId = "season-01-broken-signal"
): StoryProgressContract => ({
  seasonId,
  currentBeatId: null,
  completedBeatIds: [],
  storyFlags: {},
  irisTrust: 0,
  irisTrustTier: "UNKNOWN",
  factionRep: { hunters: 50 },
  archiveUnlockedIds: [],
})
