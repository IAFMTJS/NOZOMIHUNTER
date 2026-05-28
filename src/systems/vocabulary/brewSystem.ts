import { getCatalogEntries } from "@/systems/mastery/vocabularyCatalog"
import type { PlayerContract } from "@/contracts/player-contract"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { BREW_CONFIG } from "@/config/brewConfig"

export function canBrewWord(player: PlayerContract): boolean {
  return player.economy.brewTokens >= BREW_CONFIG.TOKEN_COST
}

export function pickBrewCandidate(
  mastery: WordMasteryContract[]
): { wordId: string; entSeq: number } | null {
  const known = new Set(mastery.map((m) => m.wordId))
  const pool = getCatalogEntries().filter((e) => !known.has(e.id))
  if (pool.length === 0) return null
  const pick = pool[Math.floor(Math.random() * pool.length)]
  return { wordId: pick.id, entSeq: pick.entSeq }
}

export function brewTokensAfterSpend(player: PlayerContract): PlayerContract {
  return {
    ...player,
    economy: {
      ...player.economy,
      brewTokens: player.economy.brewTokens - BREW_CONFIG.TOKEN_COST,
    },
    updatedAt: new Date().toISOString(),
  }
}
