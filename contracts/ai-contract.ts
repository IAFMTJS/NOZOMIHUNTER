export interface AIResponseContract {
  response: string

  emotion: EmotionType

  intent: IntentType

  confidence: number

  corrections?: string[]

  suggestedVocabulary?: string[]
}

export type EmotionType =
  | "CALM"
  | "CONFUSED"
  | "NERVOUS"
  | "FOCUSED"
  | "FRUSTRATED"

export type IntentType =
  | "GREETING"
  | "QUESTION"
  | "RESPONSE"
  | "CONFUSION"
  | "REQUEST"
  | "GOODBYE"

export interface AIMemoryContract {
  rememberedWords: string[]

  weakGrammarPatterns: string[]

  recentMistakes: string[]

  relationshipLevel: number
}