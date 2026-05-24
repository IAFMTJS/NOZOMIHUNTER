export interface ConversationResponseFamily {
  /** Normalized answer fragments accepted for this scenario. */
  patterns: string[]
  style: "formal" | "casual" | "english" | "hybrid"
  qualityBonus: number
}

export interface ConversationScenarioConfig {
  id: string
  title: string
  description: string
  directorName: string
  briefing: string
  openingLine: string
  openingLineReading: string
  requiredExchanges: number
  responseFamilies?: ConversationResponseFamily[]
}

export const CONVERSATION_SCENARIOS: ConversationScenarioConfig[] = [
  {
    id: "gate-check",
    title: "Gate Check",
    description: "The dungeon director scans your readiness at the entry gate.",
    directorName: "Director",
    briefing:
      "Respond to the Director in Japanese or English. Clear, intentional replies count as successful exchanges.",
    openingLine:
      "Hunter. State your status. 準備はいいですか？",
    openingLineReading: "junbi wa ii desu ka?",
    requiredExchanges: 3,
    responseFamilies: [
      {
        patterns: ["junbi dekite imasu", "準備できています", "prepared", "ready"],
        style: "formal",
        qualityBonus: 0.15,
      },
      {
        patterns: ["ikemasu", "いけます", "yes", "go"],
        style: "casual",
        qualityBonus: 0.1,
      },
      {
        patterns: ["ready", "yes", "ok", "hai"],
        style: "english",
        qualityBonus: 0.05,
      },
    ],
  },
  {
    id: "signal-relay",
    title: "Signal Relay",
    description: "Relay corrupted transmission fragments back to command.",
    directorName: "Operator",
    briefing:
      "The Operator needs coherent responses. Short noise will be rejected.",
    openingLine:
      "Signal unstable. Report what you understand. 何が見えますか？",
    openingLineReading: "nani ga miemasu ka?",
    requiredExchanges: 3,
    responseFamilies: [
      {
        patterns: ["mieru", "見える", "see", "signal", "corridor"],
        style: "hybrid",
        qualityBonus: 0.1,
      },
    ],
  },
  {
    id: "shadow-briefing",
    title: "Shadow Briefing",
    description: "A brief contact in the dark tests your composure.",
    directorName: "Contact",
    briefing:
      "Stay in character. The Contact rewards calm, focused answers.",
    openingLine: "You're late. Explain—簡潔に。",
    openingLineReading: "kanketsu ni.",
    requiredExchanges: 4,
    responseFamilies: [
      {
        patterns: ["traffic", "delay", "sorry", "遅れ", "すみません"],
        style: "formal",
        qualityBonus: 0.1,
      },
    ],
  },
]

export function getConversationScenario(id: string): ConversationScenarioConfig {
  return (
    CONVERSATION_SCENARIOS.find((s) => s.id === id) ??
    CONVERSATION_SCENARIOS[0]
  )
}
