import type { TerminalBreachEncounterContract, TerminalSignContract } from "@/contracts/encounter-contract"
import { getCatalogEntries } from "@/systems/mastery/vocabularyCatalog"
import { toEncounterWord } from "@/services/jmdict/normalize"
import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"

const SECTOR_SIGNS = [
  { label: "Emergency exit", trap: false },
  { label: "Restricted zone", trap: true },
  { label: "Power conduit", trap: false },
  { label: "Corruption leak", trap: true },
  { label: "Archive access", trap: false },
] as const

function toSign(
  entry: VocabularyEntryContract,
  label: string,
  isTrap?: boolean
): TerminalSignContract {
  const word = toEncounterWord(entry)
  return {
    id: word.id,
    label,
    japanese: word.japanese,
    reading: word.reading,
    romaji: word.romaji,
    meanings: word.meanings,
    isTrap,
  }
}

export function createTerminalBreachEncounter(): TerminalBreachEncounterContract {
  const pool = [...getCatalogEntries()].sort(() => Math.random() - 0.5)
  const signs = SECTOR_SIGNS.map((s, i) =>
    toSign(pool[i] ?? pool[0]!, s.label, s.trap)
  )
  const terminals = pool.slice(5, 8).map((e, i) =>
    toSign(e, `Terminal ${i + 1}`, i === 1)
  )
  return {
    sectorId: "sector-abandoned-wing",
    signs,
    terminals,
    currentStep: 0,
    alarmsTriggered: 0,
    pathUnlocked: false,
  }
}

export function interpretTerminalSign(
  encounter: TerminalBreachEncounterContract,
  signId: string
): { correct: boolean; encounter: TerminalBreachEncounterContract } {
  const all = [...encounter.signs, ...encounter.terminals]
  const sign = all.find((s) => s.id === signId)
  if (!sign) return { correct: false, encounter }

  const correct = !sign.isTrap
  const next: TerminalBreachEncounterContract = {
    ...encounter,
    currentStep: encounter.currentStep + 1,
    alarmsTriggered: correct ? encounter.alarmsTriggered : encounter.alarmsTriggered + 1,
    pathUnlocked:
      correct && encounter.currentStep + 1 >= encounter.signs.length,
  }
  return { correct, encounter: next }
}
