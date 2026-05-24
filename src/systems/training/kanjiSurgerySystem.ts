import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { toEncounterWord } from "@/services/jmdict/normalize"
import type { KanjiSurgeryTargetContract } from "@/contracts/encounter-contract"

const KANJI_POOL = JMDICT_CURATED.filter((e) =>
  e.japanese.some((ch) => /[\u4e00-\u9faf]/.test(ch))
)

export function createKanjiSurgeryTargets(count: number): KanjiSurgeryTargetContract[] {
  const picked = [...KANJI_POOL].sort(() => Math.random() - 0.5).slice(0, count)
  return picked.map((entry) => {
    const word = toEncounterWord(entry)
    return {
      id: word.id,
      japanese: word.japanese,
      reading: word.reading,
      romaji: word.romaji,
      radicals: [word.japanese.slice(0, 1), word.reading.slice(0, 1)],
      stability: 40,
    }
  })
}

export function stabilizeKanjiTarget(
  target: KanjiSurgeryTargetContract,
  success: boolean
): KanjiSurgeryTargetContract {
  const delta = success ? 25 : -15
  return {
    ...target,
    stability: Math.max(0, Math.min(100, target.stability + delta)),
  }
}

export function isKanjiSurgeryComplete(
  targets: KanjiSurgeryTargetContract[]
): boolean {
  return targets.every((t) => t.stability >= 100)
}
