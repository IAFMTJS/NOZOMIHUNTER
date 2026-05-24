import type { IntentType } from "@/contracts/ai-contract"
import { CONVERSATION_ENCOUNTER_CONFIG } from "@/config/conversationEncounterConfig"
import {
  getConversationScenario,
  type ConversationResponseFamily,
} from "@/config/conversationContentConfig"
import { normalizeAnswer, normalizeJapanese } from "@/services/jmdict/normalize"

export interface ExchangeScoreResult {
  passed: boolean
  quality: number
  feedback: string
  japaneseTokens: string[]
  style?: ConversationResponseFamily["style"]
  trustDelta?: number
}

export function extractJapaneseTokens(message: string): string[] {
  return message.match(/[\u3040-\u30ff\u4e00-\u9faf]+/g) ?? []
}

function matchesFamily(
  message: string,
  family: ConversationResponseFamily
): boolean {
  const normalized = normalizeAnswer(message)
  const jp = normalizeJapanese(message)
  return family.patterns.some((p) => {
    const pat = normalizeAnswer(p)
    const patJp = normalizeJapanese(p)
    return (
      normalized.includes(pat) ||
      pat.includes(normalized) ||
      (jp && patJp && (jp.includes(patJp) || patJp.includes(jp)))
    )
  })
}

export function scoreConversationExchange(
  message: string,
  intent: IntentType,
  scenarioId?: string
): ExchangeScoreResult {
  const trimmed = message.trim()
  const japaneseTokens = extractJapaneseTokens(trimmed)
  const hasJapanese = japaneseTokens.length > 0
  const minLen = CONVERSATION_ENCOUNTER_CONFIG.MIN_MESSAGE_LENGTH
  const scenario = scenarioId ? getConversationScenario(scenarioId) : undefined
  const families = scenario?.responseFamilies ?? []

  if (trimmed.length < minLen) {
    return {
      passed: false,
      quality: 0,
      feedback: "Transmission too weak. Elaborate.",
      japaneseTokens,
      trustDelta: -0.05,
    }
  }

  const matchedFamily = families.find((f) => matchesFamily(trimmed, f))

  if (intent === "CONFUSION" && trimmed.length < 8 && !matchedFamily) {
    return {
      passed: false,
      quality: 0.2,
      feedback: "The channel hears uncertainty. Try a clearer response.",
      japaneseTokens,
      trustDelta: -0.03,
    }
  }

  let quality = 0.4
  if (trimmed.length >= 6) quality += 0.2
  if (trimmed.length >= 12) quality += 0.1
  if (hasJapanese) quality += 0.25
  if (intent === "GREETING" || intent === "RESPONSE" || intent === "QUESTION") {
    quality += 0.1
  }
  if (matchedFamily) {
    quality += matchedFamily.qualityBonus
  }
  quality = Math.min(1, quality)

  const passed = quality >= 0.55 || matchedFamily != null

  const styleFeedback =
    matchedFamily?.style === "formal"
      ? "Formal tone registered — operator trust increased."
      : matchedFamily?.style === "casual"
        ? "Casual reply accepted."
        : matchedFamily?.style === "english"
          ? "English relay logged."
          : null

  return {
    passed,
    quality,
    feedback: passed
      ? styleFeedback ??
        (hasJapanese ? "Exchange logged. Japanese detected." : "Exchange logged.")
      : "Response rejected. Be clearer or use Japanese.",
    japaneseTokens,
    style: matchedFamily?.style,
    trustDelta: passed ? (matchedFamily?.qualityBonus ?? 0.05) : -0.05,
  }
}
