import { NPC_DIALOGUE_CONFIG } from "@/config/npcDialogueConfig"
import type { CorruptionBand } from "@/config/corruptionThresholds"

export function irisWarningLine(band: CorruptionBand): string {
  const pool = NPC_DIALOGUE_CONFIG.iris.warnings
  return pool[band] ?? pool.stable
}
