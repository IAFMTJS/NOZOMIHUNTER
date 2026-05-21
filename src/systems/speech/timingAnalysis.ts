import { SPEECH_ENCOUNTER_CONFIG } from "@/config/speechEncounterConfig"

export function scoreResponseTiming(responseTimeMs: number): number {
  const {
    MIN_RESPONSE_MS,
    MAX_RESPONSE_MS,
    IDEAL_RESPONSE_MIN_MS,
    IDEAL_RESPONSE_MAX_MS,
  } = SPEECH_ENCOUNTER_CONFIG

  if (responseTimeMs < MIN_RESPONSE_MS) {
    return 35
  }
  if (responseTimeMs > MAX_RESPONSE_MS) {
    return 20
  }
  if (
    responseTimeMs >= IDEAL_RESPONSE_MIN_MS &&
    responseTimeMs <= IDEAL_RESPONSE_MAX_MS
  ) {
    return 100
  }

  if (responseTimeMs < IDEAL_RESPONSE_MIN_MS) {
    const ratio =
      (responseTimeMs - MIN_RESPONSE_MS) /
      (IDEAL_RESPONSE_MIN_MS - MIN_RESPONSE_MS)
    return Math.round(50 + Math.max(0, ratio) * 50)
  }

  const over =
    (responseTimeMs - IDEAL_RESPONSE_MAX_MS) /
    (MAX_RESPONSE_MS - IDEAL_RESPONSE_MAX_MS)
  return Math.round(100 - Math.min(1, over) * 55)
}
