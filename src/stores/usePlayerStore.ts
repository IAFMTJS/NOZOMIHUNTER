import { create } from "zustand"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ProgressionState } from "@/systems/progression/progressionOrchestrator"
import { defaultProgression } from "@/systems/progression/unlockSystem"
import type { HunterRank } from "@/contracts/player-contract"

interface PlayerStore {
  player: PlayerContract | null
  activeQuests: QuestContract[]
  isHydrated: boolean
  levelUpNotice: number | null

  setPlayer: (player: PlayerContract) => void
  setActiveQuests: (quests: QuestContract[]) => void
  hydrate: (player: PlayerContract, quests: QuestContract[]) => void
  applyProgressionUpdate: (update: {
    xp: number
    level: number
    rank: HunterRank
    progression: PlayerContract["progression"]
    leveledUp: boolean
  }) => void
  setQuests: (quests: QuestContract[]) => void
  clearLevelUpNotice: () => void
  reset: () => void
  getProgressionState: () => ProgressionState | null
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: null,
  activeQuests: [],
  isHydrated: false,
  levelUpNotice: null,

  setPlayer: (player) => set({ player }),

  setActiveQuests: (activeQuests) => set({ activeQuests }),

  hydrate: (player, activeQuests) =>
    set({ player, activeQuests, isHydrated: true }),

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
        updatedAt: new Date().toISOString(),
      },
      levelUpNotice: update.leveledUp ? update.level : get().levelUpNotice,
    })
  },

  setQuests: (activeQuests) => set({ activeQuests }),

  clearLevelUpNotice: () => set({ levelUpNotice: null }),

  reset: () =>
    set({
      player: null,
      activeQuests: [],
      isHydrated: false,
      levelUpNotice: null,
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
