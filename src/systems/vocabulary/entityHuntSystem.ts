import type {
  EntityCaptureState,
  WordEntityMetadata,
  VocabularyThreatLevel,
} from "@/contracts/vocabulary-contract"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"

const STABILIZED_THRESHOLD = 40
const MASTERED_THRESHOLD = 80

export function classifyEntityState(mastery: number): EntityCaptureState {
  if (mastery >= MASTERED_THRESHOLD) return "MASTERED"
  if (mastery >= STABILIZED_THRESHOLD) return "STABILIZED"
  return "UNKNOWN"
}

export function entityStateLabel(state: EntityCaptureState): string {
  switch (state) {
    case "UNKNOWN":
      return "Unregistered anomaly"
    case "STABILIZED":
      return "Stabilized entity"
    case "MASTERED":
      return "Mastered entity"
  }
}

export function buildWordEntityMetadata(
  wordId: string,
  masteryRow: WordMasteryContract | undefined,
  opts?: {
    encounterSource?: string
    threatLevel?: VocabularyThreatLevel
    linkedSectors?: string[]
    loreRef?: string
    exampleTransmission?: string
  }
): WordEntityMetadata {
  const mastery = masteryRow?.mastery ?? 0
  const captureState = classifyEntityState(mastery)
  const danger = opts?.threatLevel ?? "ROUTINE"

  return {
    wordId,
    captureState,
    encounterSource: opts?.encounterSource,
    dangerClassification: danger,
    corruptionAffinity: Math.max(0, 100 - mastery),
    linkedSectors: opts?.linkedSectors,
    loreRef: opts?.loreRef,
    exampleTransmission: opts?.exampleTransmission,
    displayTitle: entityStateLabel(captureState),
    displayTag: danger.replace(/_/g, " "),
    displaySubtitle:
      captureState === "MASTERED"
        ? "Passive resonance active."
        : captureState === "STABILIZED"
          ? "Entity contained — mastery rising."
          : "Capture incomplete — deploy to stabilize.",
  }
}

/** 0–100 threat index for entity-hunt / semantic-network UI. */
export function computeEntityThreatIndex(
  mastery: number,
  threatLevel: VocabularyThreatLevel = "ROUTINE"
): number {
  const base =
    threatLevel === "SECTOR_CRITICAL" || threatLevel === "CRITICAL"
      ? 85
      : threatLevel === "ELEVATED"
        ? 65
        : 25
  return Math.min(100, Math.max(0, base + Math.round((100 - mastery) * 0.35)))
}

export function recordEntityCaptureSource(
  meta: WordEntityMetadata,
  source: string
): WordEntityMetadata {
  return {
    ...meta,
    encounterSource: source,
    displaySubtitle: `Logged from ${source}.`,
  }
}
