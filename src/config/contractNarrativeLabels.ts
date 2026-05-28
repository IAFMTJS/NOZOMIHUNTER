/** Immersion-facing quest channel labels (Screen 8). */

export const CONTRACT_NARRATIVE_LABELS = {
  daily: "Daily Rituals",
  side: "Whisper Hunts",
  story: "Archive Recovery",
} as const

export const CONTRACT_CATEGORY_BLURBS: Record<keyof typeof CONTRACT_NARRATIVE_LABELS, string> = {
  daily: "Recurring rites that keep the corridor stable.",
  side: "Optional hunts — high risk, irregular signal.",
  story: "Mainline recovery — forbidden translation ahead.",
}
