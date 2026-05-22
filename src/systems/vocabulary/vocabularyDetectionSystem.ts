import { WordMastery } from "./vocabularyMasterySystem"

interface PlayerVocabulary {
  word: string
  mastery: WordMastery
}

export interface VocabularyDetectionResult {
  unknownWords: string[]
  knownWords: string[]
}

export function detectUnknownVocabulary(
  questWords: string[],
  playerVocabulary: PlayerVocabulary[]
): VocabularyDetectionResult {

  const unknownWords: string[] = []
  const knownWords: string[] = []

  for (const word of questWords) {

    const existingWord =
      playerVocabulary.find(
        (entry) => entry.word === word
      )

    if (
      !existingWord ||
      existingWord.mastery === "UNKNOWN"
    ) {
      unknownWords.push(word)
    } else {
      knownWords.push(word)
    }
  }

  return {
    unknownWords,
    knownWords
  }
}