import type { IntentType } from "@/contracts/ai-contract"
import { CONVERSATION_ENCOUNTER_CONFIG } from "@/config/conversationEncounterConfig"

export interface ExchangeScoreResult {
  passed: boolean
  quality: number
  feedback: string
  japaneseTokens: string[]
}

export function extractJapaneseTokens(message: string): string[] {
  return message.match(/[\u3040-\u30ff\u4e00-\u9faf]+/g) ?? []
}

export function scoreConversationExchange(
  message: string,
  intent: IntentType
): ExchangeScoreResult {
  const trimmed = message.trim()
  const japaneseTokens = extractJapaneseTokens(trimmed)
  const hasJapanese = japaneseTokens.length > 0
  const minLen = CONVERSATION_ENCOUNTER_CONFIG.MIN_MESSAGE_LENGTH

  if (trimmed.length < minLen) {
    return {
      passed: false,
      quality: 0,
      feedback: "Transmission too weak. Elaborate.",
      japaneseTokens,
    }
  }

  if (intent === "CONFUSION" && trimmed.length < 8) {
    return {
      passed: false,
      quality: 0.2,
      feedback: "The channel hears uncertainty. Try a clearer response.",
      japaneseTokens,
    }
  }

  let quality = 0.4
  if (trimmed.length >= 6) quality += 0.2
  if (trimmed.length >= 12) quality += 0.1
  if (hasJapanese) quality += 0.25
  if (intent === "GREETING" || intent === "RESPONSE" || intent === "QUESTION") {
    quality += 0.1
  }
  quality = Math.min(1, quality)

  const passed = quality >= 0.55

  return {
    passed,
    quality,
    feedback: passed
      ? hasJapanese
        ? "Exchange logged. Japanese detected."
        : "Exchange logged."
      : "Response rejected. Be clearer or use Japanese.",
    japaneseTokens,
  }
}
