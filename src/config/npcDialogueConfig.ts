/** Home / contacts NPC one-liners (GDD Vol 6 — Iris liaison). */
export const NPC_DIALOGUE_CONFIG = {
  iris: {
    key: "iris",
    label: "Iris",
    role: "Sector analyst",
    warnings: {
      stable: "Channel stable. Maintain corridor discipline.",
      unstable: "Corruption surge detected in your sector.",
      dangerous: "Breach risk rising — stabilize before deploy.",
      critical: "Forced warden trace imminent. Abort or seal now.",
      collapse: "Sector collapse signature. No extraction lane.",
    } as Record<string, string>,
  },
} as const
