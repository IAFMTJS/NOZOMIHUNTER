export interface SpeechScenarioConfig {
  id: string
  title: string
  description: string
  briefing: string
}

export const SPEECH_QUEST_VARIANTS = [
  {
    title: "Voice Trace",
    description: "Transmit spoken signatures before the channel collapses.",
    briefing:
      "Speak each glyph clearly. The system scores pronunciation, timing, and composure — not perfection.",
  },
  {
    title: "Resonance Lock",
    description: "Stabilize corrupted audio locks with your voice.",
    briefing:
      "Hold your nerve. Hesitation and rushed blurts degrade your resonance score.",
  },
  {
    title: "Echo Hunt",
    description: "Match field echoes before they fade from the network.",
    briefing:
      "Read the target, then speak. Typed fallback works, but live voice earns full weight.",
  },
] as const

export const SPEECH_SCENARIOS: SpeechScenarioConfig[] = [
  {
    id: "field-relay",
    title: "Field Relay",
    description: "Relay spoken vocabulary signatures across a unstable channel.",
    briefing:
      "Each phrase is a live transmission. Clear Japanese or romaji readings register strongest.",
  },
  {
    id: "comms-test",
    title: "Comms Test",
    description: "Prove your comms discipline under Director monitoring.",
    briefing:
      "Speak with intent. Fillers and long dead air erode confidence — the Director is listening.",
  },
]

export function getSpeechScenario(id: string): SpeechScenarioConfig {
  return SPEECH_SCENARIOS.find((s) => s.id === id) ?? SPEECH_SCENARIOS[0]
}

export function speechFeedbackLine(
  compositeScore: number,
  passed: boolean
): string {
  if (passed && compositeScore >= 85) {
    return "Clean transmission. The channel holds."
  }
  if (passed) {
    return "Signal accepted. Refine tone on the next phrase."
  }
  if (compositeScore >= 45) {
    return "Weak resonance. Speak slower and hit each mora."
  }
  return "Signal rejected. The field drowned you out."
}
