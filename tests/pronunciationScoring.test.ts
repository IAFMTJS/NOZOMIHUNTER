import { describe, expect, it } from "vitest"
import {
  phraseMeaningAcceptanceSet,
  phrasePronunciationAcceptanceSet,
  scoreMeaningComprehension,
  scorePronunciation,
} from "@/systems/speech/pronunciationScoring"
import type { SpeechPhraseContract } from "@/contracts/encounter-contract"

const waterPhrase: SpeechPhraseContract = {
  id: "1",
  japanese: "水",
  reading: "みず",
  romaji: "mizu",
  meanings: ["water"],
}

describe("pronunciationScoring", () => {
  it("keeps meanings out of pronunciation acceptance", () => {
    const pronunciation = phrasePronunciationAcceptanceSet(waterPhrase)
    const meanings = phraseMeaningAcceptanceSet(waterPhrase)
    expect(pronunciation.has("water")).toBe(false)
    expect(meanings.has("water")).toBe(true)
  })

  it("does not pass pronunciation on English gloss alone", () => {
    const { score } = scorePronunciation("water", waterPhrase)
    expect(score).toBeLessThan(100)
  })

  it("passes pronunciation on romaji or Japanese forms", () => {
    expect(scorePronunciation("mizu", waterPhrase).score).toBe(100)
    expect(scorePronunciation("みず", waterPhrase).score).toBe(100)
    expect(scorePronunciation("水", waterPhrase).score).toBe(100)
  })

  it("scores meaning comprehension separately", () => {
    expect(scoreMeaningComprehension("water", waterPhrase)).toBe(100)
    expect(scoreMeaningComprehension("mizu", waterPhrase)).toBe(0)
  })
})
