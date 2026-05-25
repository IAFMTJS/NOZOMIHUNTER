import type { QuestNarrativeTier } from "@/contracts/quest-contract"

const STORY_BRIEFING_LINES = [
  "Archive static thickens — narrative channel active.",
  "Operator mythos bleeds through corrupted relay.",
  "Meaningful progression — not maintenance sync.",
]

const SIDE_BRIEFING_LINES = [
  "Experimental contract — gimmick protocol engaged.",
  "Side channel anomaly — expect non-standard mechanics.",
]

export function storyChannelBriefing(tier: QuestNarrativeTier | undefined): string | null {
  if (tier === "MAIN") {
    return STORY_BRIEFING_LINES[Math.floor(Math.random() * STORY_BRIEFING_LINES.length)]
  }
  if (tier === "SIDE") {
    return SIDE_BRIEFING_LINES[Math.floor(Math.random() * SIDE_BRIEFING_LINES.length)]
  }
  return null
}

export function storyScreenClass(tier: QuestNarrativeTier | undefined): string {
  if (tier === "MAIN") return "nozomi-screen-story"
  if (tier === "SIDE") return "nozomi-screen-side"
  if (tier === "DAILY") return "nozomi-screen-daily"
  return ""
}
