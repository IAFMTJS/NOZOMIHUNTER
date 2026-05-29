/** Sector / run corruption presentation bands (GDD Vol 3–4). */
export const CORRUPTION_THRESHOLDS = {
  STABLE_MAX: 24,
  UNSTABLE_MAX: 49,
  DANGEROUS_MAX: 74,
  CRITICAL_MAX: 99,
  COLLAPSE: 100,
} as const

export type CorruptionBand =
  | "stable"
  | "unstable"
  | "dangerous"
  | "critical"
  | "collapse"

export function corruptionBandFromPercent(pct: number): CorruptionBand {
  const v = Math.max(0, Math.min(100, Math.round(pct)))
  if (v >= CORRUPTION_THRESHOLDS.COLLAPSE) return "collapse"
  if (v > CORRUPTION_THRESHOLDS.DANGEROUS_MAX) return "critical"
  if (v > CORRUPTION_THRESHOLDS.UNSTABLE_MAX) return "dangerous"
  if (v > CORRUPTION_THRESHOLDS.STABLE_MAX) return "unstable"
  return "stable"
}

export function corruptionBandCssClass(band: CorruptionBand): string {
  switch (band) {
    case "stable":
      return "nozomi-corruption-band--stable"
    case "unstable":
      return "nozomi-corruption-band--unstable"
    case "dangerous":
      return "nozomi-corruption-band--dangerous"
    case "critical":
      return "nozomi-corruption-band--critical"
    case "collapse":
      return "nozomi-corruption-band--collapse"
  }
}
