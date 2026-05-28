import type { QuestChannelTab } from "@/features/contracts/components/ContractsClient"

const CHANNEL_COPY: Record<
  QuestChannelTab,
  { kicker: string; defaultLine: string }
> = {
  daily: {
    kicker: "Daily Rituals",
    defaultLine: "Maintenance contracts indexed for today's cycle.",
  },
  story: {
    kicker: "Archive Recovery",
    defaultLine: "Recovered files surface as chapter missions — extract in order.",
  },
  side: {
    kicker: "Whisper Hunts",
    defaultLine: "Side channels carry unstable intel — deploy when stamina allows.",
  },
  achievements: {
    kicker: "Hunter Record",
    defaultLine: "Milestones logged from the field — claim when the seal breaks.",
  },
}

export function contractChannelKicker(tab: QuestChannelTab): string {
  return CHANNEL_COPY[tab].kicker
}

export function contractChannelDefaultLine(tab: QuestChannelTab): string {
  return CHANNEL_COPY[tab].defaultLine
}
