import type { HunterRank } from "@/contracts/player-contract"

export const RPG_STATS_CONFIG = {
  BASE: {
    strength: 8,
    agility: 8,
    intelligence: 10,
    vitality: 10,
  },
  PER_LEVEL: {
    strength: 2,
    agility: 2,
    intelligence: 3,
    vitality: 2,
  },
  RANK_BONUS: {
    E: 0,
    D: 2,
    C: 4,
    B: 6,
    A: 10,
    S: 14,
    SS: 18,
    SSS: 22,
  } satisfies Record<HunterRank, number>,
  CAPS: {
    strength: 500,
    agility: 500,
    intelligence: 500,
    vitality: 500,
  },
  LEVEL_UP_DELTA: {
    strength: 1,
    agility: 1,
    intelligence: 2,
    vitality: 1,
  },
} as const
