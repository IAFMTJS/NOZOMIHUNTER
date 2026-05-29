import {
  corruptionBandCssClass,
  corruptionBandFromPercent,
  type CorruptionBand,
} from "@/config/corruptionThresholds"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"

export function hunterCorruptionBand(
  penalties: PlayerPenaltyContract
): CorruptionBand {
  return corruptionBandFromPercent(penalties.corruption)
}

export function runCorruptionPercent(runCorruption?: number, threatPressure?: number): number {
  if (runCorruption != null) return Math.round(runCorruption)
  if (threatPressure != null) return Math.round(threatPressure)
  return 0
}

export function shellClassesForCorruptionBand(band: CorruptionBand): string {
  return `${corruptionBandCssClass(band)} ${corruptionStageClass(band)}`
}

/** GDD Vol 9 corruption visual stages 1–4 */
export function corruptionStageFromBand(band: CorruptionBand): 1 | 2 | 3 | 4 {
  switch (band) {
    case "stable":
      return 1
    case "unstable":
      return 2
    case "dangerous":
    case "critical":
      return 3
    case "collapse":
      return 4
  }
}

export function corruptionStageClass(band: CorruptionBand): string {
  return `nozomi-corruption-stage-${corruptionStageFromBand(band)}`
}

export function corruptionStageAssetKey(band: CorruptionBand): string {
  return `corruption.stage.${corruptionStageFromBand(band)}`
}

export function corruptionThresholdCopy(band: CorruptionBand): string {
  switch (band) {
    case "stable":
      return "Signal stable"
    case "unstable":
      return "Minor distortion detected"
    case "dangerous":
      return "Sector flicker — corruption rising"
    case "critical":
      return "Critical breach band"
    case "collapse":
      return "Collapse imminent"
  }
}
