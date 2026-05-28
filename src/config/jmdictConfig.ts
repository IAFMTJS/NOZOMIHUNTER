/** Lower tier = higher frequency priority for encounters. */
export const JMDICT_FREQUENCY_TIERS = {
  ICHI1: 1,
  ICHI2: 2,
  NEWS1: 3,
  NEWS2: 4,
  SPEC1: 5,
  SPEC2: 6,
  GAI1: 7,
  GAI2: 8,
  UNKNOWN: 50,
} as const

export const JMDICT_MASTERY = {
  CORRECT_GAIN: 12,
  WRONG_PENALTY: 4,
  ENCOUNTER_PICK_POOL_MULTIPLIER: 3,
} as const

/** Max rows merged from Supabase into the in-memory catalog (post-curated). */
export const JMDICT_DB_LOAD_LIMIT = 2000

/** Map frequency tier bands to JLPT labels when XML has no JLPT tag. */
export function inferJlptFromFrequencyTier(tier: number): string | undefined {
  if (tier <= 2) return "N5"
  if (tier <= 4) return "N4"
  if (tier <= 6) return "N3"
  if (tier <= 10) return "N2"
  if (tier <= 20) return "N1"
  return undefined
}
