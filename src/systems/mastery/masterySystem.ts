import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { JMDICT_MASTERY } from "@/config/jmdictConfig"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { masteryTierFromPercent } from "@/systems/presentation/masteryPresentationSystem"

const masteryByWord = new Map<string, WordMasteryContract>()

export function resetMasteryState(): void {
  masteryByWord.clear()
}

export function hydrateMastery(rows: WordMasteryContract[]): void {
  resetMasteryState()
  for (const row of rows) {
    masteryByWord.set(row.wordId, row)
  }
}

export function getMasteryMap(): Map<string, number> {
  const out = new Map<string, number>()
  for (const [id, row] of masteryByWord) {
    out.set(id, row.mastery)
  }
  return out
}

export function getMastery(wordId: string): number {
  return masteryByWord.get(wordId)?.mastery ?? 0
}

export function getMasterySnapshot(): WordMasteryContract[] {
  return [...masteryByWord.values()]
}

export function setMasteryPercent(
  wordId: string,
  mastery: number,
  options?: { correctCount?: number; wrongCount?: number }
): WordMasteryContract {
  const current = masteryByWord.get(wordId)
  const next: WordMasteryContract = {
    wordId,
    mastery: Math.max(0, Math.min(100, mastery)),
    correctCount: options?.correctCount ?? current?.correctCount ?? 0,
    wrongCount: options?.wrongCount ?? current?.wrongCount ?? 0,
    lastSeenAt: new Date().toISOString(),
  }
  masteryByWord.set(wordId, next)
  return next
}

export function recordWordAnswer(
  wordId: string,
  correct: boolean,
  playerId?: string
): WordMasteryContract {
  const current = masteryByWord.get(wordId)
  const now = new Date().toISOString()

  const delta = correct
    ? JMDICT_MASTERY.CORRECT_GAIN
    : -JMDICT_MASTERY.WRONG_PENALTY

  const prevPercent = current?.mastery ?? 0
  const prevTier = masteryTierFromPercent(prevPercent)

  const next: WordMasteryContract = {
    wordId,
    mastery: Math.min(
      100,
      Math.max(0, (current?.mastery ?? 0) + delta)
    ),
    correctCount: (current?.correctCount ?? 0) + (correct ? 1 : 0),
    wrongCount: (current?.wrongCount ?? 0) + (correct ? 0 : 1),
    lastSeenAt: now,
  }

  masteryByWord.set(wordId, next)

  const nextTier = masteryTierFromPercent(next.mastery)
  if (playerId && nextTier !== prevTier) {
    eventBus.emit(GAME_EVENTS.MASTERY_TIER_UP, {
      playerId,
      wordId,
      tier: nextTier,
      mastery: next.mastery,
    })
  }

  if (
    playerId &&
    correct &&
    next.mastery >= 80 &&
    prevPercent < 80
  ) {
    eventBus.emit(GAME_EVENTS.VOCABULARY_MASTERED, {
      playerId,
      wordId,
      mastery: next.mastery,
    })
    eventBus.emit(GAME_EVENTS.WORD_BOUND, {
      playerId,
      wordId,
      mastery: next.mastery,
    })
  }

  return next
}
