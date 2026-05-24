import { describe, expect, it } from "vitest"
import {
  buildAcceptedAnswers,
  matchesChallengeAnswer,
} from "@/systems/learning/answerValidationSystem"

const sampleWord = {
  id: "w1",
  japanese: "水",
  reading: "みず",
  romaji: "mizu",
  meanings: ["water"],
  promptDirection: "RETRIEVE_ENGLISH" as const,
  inputMode: "english" as const,
}

describe("answerValidationSystem", () => {
  it("accepts english meaning for RETRIEVE_ENGLISH", () => {
    expect(matchesChallengeAnswer(sampleWord, "water")).toBe(true)
    expect(matchesChallengeAnswer(sampleWord, "fire")).toBe(false)
  })

  it("accepts romaji for RETRIEVE_READING", () => {
    const word = {
      ...sampleWord,
      promptDirection: "RETRIEVE_READING" as const,
      inputMode: "romaji" as const,
    }
    expect(buildAcceptedAnswers(word).has("mizu")).toBe(true)
    expect(matchesChallengeAnswer(word, "mizu")).toBe(true)
  })

  it("accepts kana for kana input mode", () => {
    const word = {
      ...sampleWord,
      promptDirection: "RETRIEVE_READING" as const,
      inputMode: "kana" as const,
    }
    expect(matchesChallengeAnswer(word, "みず")).toBe(true)
  })
})
