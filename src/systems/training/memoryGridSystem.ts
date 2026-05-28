import { getCatalogEntries } from "@/systems/mastery/vocabularyCatalog"
import { toEncounterWord } from "@/services/jmdict/normalize"
import type {
  MemoryGridCardContract,
  MemoryGridRoundContract,
} from "@/contracts/encounter-contract"

const DEFAULT_PAIRS = 4
const TIME_LIMIT_SEC = 90

export function createMemoryGridRound(
  pairCount = DEFAULT_PAIRS
): MemoryGridRoundContract {
  const pool = [...getCatalogEntries()].sort(() => Math.random() - 0.5)
  const cards: MemoryGridCardContract[] = []
  for (let i = 0; i < pairCount; i++) {
    const entry = pool[i]
    if (!entry) break
    const word = toEncounterWord(entry)
    const pairId = `pair-${i}`
    cards.push(
      {
        id: `${pairId}-jp`,
        pairId,
        face: word.japanese,
        reading: word.reading,
      },
      {
        id: `${pairId}-en`,
        pairId,
        face: word.meanings[0] ?? word.romaji,
      }
    )
  }
  return {
    cards: cards.sort(() => Math.random() - 0.5),
    flippedIds: [],
    matchedPairIds: [],
    moves: 0,
    timeLimitSec: TIME_LIMIT_SEC,
  }
}

export function flipMemoryGridCard(
  round: MemoryGridRoundContract,
  cardId: string
): {
  round: MemoryGridRoundContract
  matched: boolean
  mismatch: boolean
  complete: boolean
} {
  const card = round.cards.find((c) => c.id === cardId)
  if (card && round.matchedPairIds.includes(card.pairId)) {
    return { round, matched: false, mismatch: false, complete: isMemoryGridComplete(round) }
  }
  if (!card || round.flippedIds.includes(cardId)) {
    return { round, matched: false, mismatch: false, complete: isMemoryGridComplete(round) }
  }

  const flipped = [...round.flippedIds, cardId]
  if (flipped.length === 1) {
    return {
      round: { ...round, flippedIds: flipped },
      matched: false,
      mismatch: false,
      complete: false,
    }
  }

  const [aId, bId] = flipped.slice(-2)
  const a = round.cards.find((c) => c.id === aId)
  const b = round.cards.find((c) => c.id === bId)
  const moves = round.moves + 1

  if (a && b && a.pairId === b.pairId) {
    const matchedPairIds = [...round.matchedPairIds, a.pairId]
    const next: MemoryGridRoundContract = {
      ...round,
      flippedIds: [],
      matchedPairIds,
      moves,
    }
    return {
      round: next,
      matched: true,
      mismatch: false,
      complete: isMemoryGridComplete(next),
    }
  }

  return {
    round: { ...round, flippedIds: flipped, moves },
    matched: false,
    mismatch: true,
    complete: false,
  }
}

export function resetMemoryGridFlips(
  round: MemoryGridRoundContract
): MemoryGridRoundContract {
  return { ...round, flippedIds: [] }
}

export function isMemoryGridComplete(round: MemoryGridRoundContract): boolean {
  const pairIds = new Set(round.cards.map((c) => c.pairId))
  return pairIds.size > 0 && round.matchedPairIds.length >= pairIds.size
}

export function memoryGridTimeExpired(round: MemoryGridRoundContract, startedAtMs: number): boolean {
  return Date.now() - startedAtMs > round.timeLimitSec * 1000
}
