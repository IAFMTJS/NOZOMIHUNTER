import type { HintWordContextContract } from "@/contracts/hint-contract"
import type {
  AnswerInputMode,
  ChallengePromptDirection,
} from "@/contracts/encounter-contract"
import { getMastery } from "@/systems/mastery/masterySystem"

export function buildHintWordContext(input: {
  wordId: string
  japanese: string
  reading?: string
  romaji?: string
  meanings?: string[]
  meaning?: string
  promptDirection: ChallengePromptDirection
  inputMode?: AnswerInputMode
  wrongAttempts?: number
}): HintWordContextContract {
  return {
    wordId: input.wordId,
    japanese: input.japanese,
    reading: input.reading ?? "",
    romaji: input.romaji ?? "",
    meaning: input.meanings?.[0] ?? input.meaning ?? "",
    masteryScore: getMastery(input.wordId),
    wrongAttempts: input.wrongAttempts ?? 0,
    promptDirection: input.promptDirection,
  }
}
