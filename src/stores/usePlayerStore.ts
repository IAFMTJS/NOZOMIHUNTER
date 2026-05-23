import { create } from "zustand"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ProgressionState } from "@/systems/progression/progressionTypes"
import type { HunterRank } from "@/contracts/player-contract"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"

interface PlayerStore {
  player: PlayerContract | null
  activeQuests: QuestContract[]
  isHydrated: boolean
  levelUpNotice: number | null
  rankUpNotice: HunterRank | null
  unlockNoticeQueue: string[]

  setPlayer: (player: PlayerContract) => void
  setActiveQuests: (quests: QuestContract[]) => void
  hydrate: (player: PlayerContract, quests: QuestContract[]) => void
  applyProgressionUpdate: (update: {
    xp: number
    level: number
    rank: HunterRank
    progression: PlayerContract["progression"]
    penalties: PlayerContract["penalties"]
    leveledUp: boolean
    rankUp?: boolean
    newUnlocks?: string[]
  }) => void
  applyPenalties: (penalties: PlayerContract["penalties"]) => void
  updateQuest: (quest: QuestContract) => void
  setQuests: (quests: QuestContract[]) => void
  clearLevelUpNotice: () => void
  clearRankUpNotice: () => void
  dismissUnlockNotice: () => void
  reset: () => void
  getProgressionState: () => ProgressionState | null
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: null,
  activeQuests: [],
  isHydrated: false,
  levelUpNotice: null,
  rankUpNotice: null,
  unlockNoticeQueue: [],

  setPlayer: (player) => set({ player }),

  setActiveQuests: (activeQuests) => set({ activeQuests }),

  hydrate: (player, activeQuests) =>
    set({ player, activeQuests: dedupeActiveQuests(activeQuests), isHydrated: true }),

  applyProgressionUpdate: (update) => {
    const player = get().player
    if (!player) return

    set({
      player: {
        ...player,
        xp: update.xp,
        level: update.level,
        rank: update.rank,
        progression: update.progression,
        penalties: update.penalties,
        updatedAt: new Date().toISOString(),
      },
      levelUpNotice: update.leveledUp ? update.level : get().levelUpNotice,
      rankUpNotice: update.rankUp ? update.rank : get().rankUpNotice,
      unlockNoticeQueue:
        update.newUnlocks?.length
          ? [...get().unlockNoticeQueue, ...update.newUnlocks]
          : get().unlockNoticeQueue,
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

  clearLevelUpNotice: () => set({ levelUpNotice: null }),

  clearRankUpNotice: () => set({ rankUpNotice: null }),

  dismissUnlockNotice: () =>
    set((state) => ({ unlockNoticeQueue: state.unlockNoticeQueue.slice(1) })),

  reset: () =>
    set({
      player: null,
      activeQuests: [],
      isHydrated: false,
      levelUpNotice: null,
      rankUpNotice: null,
      unlockNoticeQueue: [],
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
