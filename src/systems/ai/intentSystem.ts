import type { IntentType } from "@/contracts/ai-contract"

const GREETING_PATTERNS = [/こんにちは/, /hello/i, /hi\b/i]
const QUESTION_PATTERNS = [/\?/, /か\?/, /what/i, /how/i]

export function detectIntent(message: string): IntentType {
  const trimmed = message.trim()
  if (GREETING_PATTERNS.some((p) => p.test(trimmed))) return "GREETING"
  if (QUESTION_PATTERNS.some((p) => p.test(trimmed))) return "QUESTION"
  if (/bye|さよなら|また/i.test(trimmed)) return "GOODBYE"
  if (/help|わからない|confused/i.test(trimmed)) return "CONFUSION"
  if (/please|お願い|ください/i.test(trimmed)) return "REQUEST"
  return "RESPONSE"
}
