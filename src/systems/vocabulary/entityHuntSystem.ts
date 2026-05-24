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
