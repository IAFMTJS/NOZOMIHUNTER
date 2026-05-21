import type { EmotionType } from "@/contracts/ai-contract"

export function detectEmotion(message: string): EmotionType {
  if (/!{2,}|怒|むか/i.test(message)) return "FRUSTRATED"
  if (/\?|わから|confused/i.test(message)) return "CONFUSED"
  if (/...|えっと|um/i.test(message)) return "NERVOUS"
  if (message.length > 40) return "FOCUSED"
  return "CALM"
}
