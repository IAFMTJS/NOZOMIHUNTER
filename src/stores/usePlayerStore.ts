import { create } from "zustand"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ProgressionState } from "@/systems/progression/progressionTypes"
import type { HunterRank } from "@/contracts/player-contract"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import { applyLevelUpDelta } from "@/systems/progression/rpgStatsSystem"
import { buildLevelUpCeremonyViewModel } from "@/systems/presentation/ceremonies/levelUpCeremonyData"
import { syncCorruptionAudio } from "@/systems/audio/registerAudioHandlers"
import type { LevelUpCeremonyViewModel } from "@/systems/presentation/ceremonies/ceremonyTypes"
import type { TrainingSessionSummaryViewModel } from "@/systems/training/trainingSessionSummarySystem"

interface PlayerStore {
  player: PlayerContract | null
  activeQuests: QuestContract[]
  isHydrated: boolean
  levelUpCeremony: LevelUpCeremonyViewModel | null
  rankUpNotice: HunterRank | null
  unlockNoticeQueue: string[]
  trainingResultsCeremony: {
    summary: TrainingSessionSummaryViewModel
    playAgainHref: string
  } | null

  setPlayer: (player: PlayerContract) => void
  setActiveQuests: (quests: QuestContract[]) => void
  hydrate: (player: PlayerContract, quests: QuestContract[]) => void
  markHydrationTerminal: () => void
  applyProgressionUpdate: (update: {
    xp: number
    level: number
    rank: HunterRank
    progression: PlayerContract["progression"]
    penalties: PlayerContract["penalties"]
    leveledUp: boolean
    rankUp?: boolean
    newUnlocks?: string[]
    stats?: PlayerContract["stats"]
  }) => void
  applyPenalties: (penalties: PlayerContract["penalties"]) => void
  updateQuest: (quest: QuestContract) => void
  setQuests: (quests: QuestContract[]) => void
  clearLevelUpCeremony: () => void
  clearRankUpNotice: () => void
  dismissUnlockNotice: () => void
  clearTrainingResultsCeremony: () => void
  setTrainingResultsCeremony: (
    payload: { summary: TrainingSessionSummaryViewModel; playAgainHref: string } | null
  ) => void
  reset: () => void
  getProgressionState: () => ProgressionState | null
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: null,
  activeQuests: [],
  isHydrated: false,
  levelUpCeremony: null,
  rankUpNotice: null,
  unlockNoticeQueue: [],
  trainingResultsCeremony: null,

  setPlayer: (player) => set({ player }),

  setActiveQuests: (activeQuests) => set({ activeQuests }),

  hydrate: (player, activeQuests) =>
    set({ player, activeQuests: dedupeActiveQuests(activeQuests), isHydrated: true }),

  markHydrationTerminal: () => set({ isHydrated: true }),

  applyProgressionUpdate: (update) => {
    const player = get().player
    if (!player) return

    const levelsGained = update.leveledUp
      ? Math.max(0, update.level - player.level)
      : 0
    const rpgStats =
      levelsGained > 0
        ? applyLevelUpDelta(player.rpgStats, levelsGained, update.rank)
        : player.rpgStats

    const previousLevel = player.level
    const unlockKeys = update.newUnlocks ?? []
    const levelUpCeremony = update.leveledUp
      ? buildLevelUpCeremonyViewModel(previousLevel, update.level, unlockKeys)
      : get().levelUpCeremony

    const unlockQueue = update.newUnlocks?.length
      ? [...get().unlockNoticeQueue, ...update.newUnlocks]
      : get().unlockNoticeQueue

    set({
      player: {
        ...player,
        xp: update.xp,
        level: update.level,
        rank: update.rank,
        rpgStats,
        progression: update.progression,
        penalties: update.penalties,
        stats: update.stats ?? player.stats,
        updatedAt: new Date().toISOString(),
      },
      levelUpCeremony,
      rankUpNotice: update.rankUp ? update.rank : get().rankUpNotice,
      unlockNoticeQueue: update.leveledUp
        ? unlockQueue.filter((k) => !unlockKeys.includes(k))
        : unlockQueue,
    })
  },

  applyPenalties: (penalties) => {
    const player = get().player
    if (!player) return
    set({
      player: {
        ...player,
        penalties,
        updatedAt: new Date().toISOString(),
      },
    })
    if (typeof window !== "undefined") {
      syncCorruptionAudio(penalties.corruption)
    }
  },

  updateQuest: (quest) => {
    set({
      activeQuests: get().activeQuests.map((q) =>
        q.id === quest.id ? quest : q
      ),
    })
  },

  setQuests: (activeQuests) =>
    set({ activeQuests: dedupeActiveQuests(activeQuests) }),

  clearLevelUpCeremony: () => set({ levelUpCeremony: null }),

  clearRankUpNotice: () => set({ rankUpNotice: null }),

  dismissUnlockNotice: () =>
    set((state) => ({ unlockNoticeQueue: state.unlockNoticeQueue.slice(1) })),

  setTrainingResultsCeremony: (trainingResultsCeremony) =>
    set({ trainingResultsCeremony }),

  clearTrainingResultsCeremony: () => set({ trainingResultsCeremony: null }),

  reset: () =>
    set({
      player: null,
      activeQuests: [],
      isHydrated: false,
      levelUpCeremony: null,
      rankUpNotice: null,
      unlockNoticeQueue: [],
      trainingResultsCeremony: null,
    }),

  getProgressionState: () => {
    const { player } = get()
    if (!player) return null
    return {
      xp: player.xp,
      level: player.level,
      rank: player.rank,
      penalties: player.penalties,
      progression: player.progression,
    }
  },
}))
