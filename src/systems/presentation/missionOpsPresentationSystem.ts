import type { QuestContract } from "@/contracts/quest-contract"

export interface MissionOpsPresentation {
  sectorBlurb: string
  dangerTier: string
  instabilityPct: number
  signalStrength: number
  recommendedRank: string
}

const TYPE_BLURBS: Record<QuestContract["type"], string> = {
  VOCABULARY: "Sector lexicon corruption detected — stabilize glyphs.",
  CONVERSATION: "Civilian reports indicate unstable dialogue patterns.",
  LISTENING: "Audio intercept corridor showing signal drift.",
  SPEECH: "Voice registry mismatch — transmission verification required.",
  DUNGEON: "Dungeon sector breach — extraction advised.",
  RAID: "Multi-operator raid channel unstable.",
}

export function buildMissionOpsPresentation(
  quest: QuestContract
): MissionOpsPresentation {
  const tier = quest.difficulty
  const instabilityPct =
    tier === "NIGHTMARE"
      ? 92
      : tier === "ELITE"
        ? 78
        : tier === "HARD"
          ? 62
          : tier === "NORMAL"
            ? 45
            : 28

  return {
    sectorBlurb: TYPE_BLURBS[quest.type] ?? "Registry anomaly indexed.",
    dangerTier: tier,
    instabilityPct,
    signalStrength: Math.max(20, 100 - instabilityPct),
    recommendedRank:
      tier === "HARD" || tier === "ELITE" || tier === "NIGHTMARE" ? "C" : "E",
  }
}
