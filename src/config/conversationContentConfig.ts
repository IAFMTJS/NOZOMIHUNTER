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
  {
    id: "iris-briefing",
    title: "Iris Briefing",
    description: "Iris assigns your first breach protocol.",
    directorName: "Iris",
    briefing: "Answer Iris with intent. Japanese replies earn trust.",
    openingLine: "Hunter designation confirmed. 準備は整いましたか？",
    openingLineReading: "junbi wa totonoimashita ka?",
    requiredExchanges: 3,
    responseFamilies: [
      {
        patterns: ["hai", "はい", "ready", "junbi", "準備"],
        style: "formal",
        qualityBonus: 0.15,
      },
    ],
  },
  {
    id: "operator-seven",
    title: "Operator Seven",
    description: "A cold relay from Operator 7 tests your composure.",
    directorName: "Operator 7",
    briefing: "Decode the operator's implication under pressure.",
    openingLine: "Channel open. 何が起きていますか？",
    openingLineReading: "nani ga okite imasu ka?",
    requiredExchanges: 3,
    responseFamilies: [
      {
        patterns: ["signal", "corruption", "信号", "腐敗", "mieru"],
        style: "hybrid",
        qualityBonus: 0.12,
      },
    ],
  },
  {
    id: "static-confession",
    title: "Static Confession",
    description: "Iris admits less than she knows.",
    directorName: "Iris",
    briefing: "Read between the lines. Trust shifts here.",
    openingLine: "The registry knew your name before you logged in. 説明できますか？",
    openingLineReading: "setsumei dekimasu ka?",
    requiredExchanges: 4,
    responseFamilies: [
      {
        patterns: ["explain", "why", "なぜ", "doushite", "registry"],
        style: "formal",
        qualityBonus: 0.12,
      },
    ],
  },
  {
    id: "iris-truth",
    title: "Iris Truth",
    description: "Iris withholds the location of Nozomi.",
    directorName: "Iris",
    briefing: "Press carefully. Wrong tone closes the channel.",
    openingLine: "Nozomi is not what the archive says. 信じますか？",
    openingLineReading: "shinjimasu ka?",
    requiredExchanges: 4,
    responseFamilies: [
      {
        patterns: ["trust", "believe", "信じ", "nozomi", "望み"],
        style: "formal",
        qualityBonus: 0.15,
      },
    ],
  },
  {
    id: "lost-ones-rescue",
    title: "Lost Ones Rescue",
    description: "Decode the last transmissions from operators trapped between sectors.",
    directorName: "Lost Signal",
    briefing:
      "Three operators went silent in the fracture. Reconstruct their final exchanges.",
    openingLine:
      "…can anyone hear— 助けて。Designation Lost One. Who are you?",
    openingLineReading: "tasukete.",
    requiredExchanges: 4,
    responseFamilies: [
      {
        patterns: ["hunter", "registry", "nozomi", "operator", "ハンター", "救助"],
        style: "hybrid",
        qualityBonus: 0.15,
      },
      {
        patterns: ["location", "sector", "where", "どこ", "座標"],
        style: "formal",
        qualityBonus: 0.1,
      },
    ],
  },
  {
    id: "broken-signal-finale",
    title: "Broken Signal Finale",
    description: "Season finale — the signal speaks in perfect grammar.",
    directorName: "Unknown",
    briefing: "Semantic network active. Connect the fragments.",
    openingLine: "望みは記録ではない。 What does that mean to you?",
    openingLineReading: "nozomi wa kiroku dewa nai.",
    requiredExchanges: 5,
    responseFamilies: [
      {
        patterns: ["hope", "record", "望み", "記録", "truth", "真実"],
        style: "hybrid",
        qualityBonus: 0.2,
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
