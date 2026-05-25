import type { DungeonThreatState } from "@/contracts/dungeon-contract"
import { bossAwarenessWhisperLine } from "@/systems/dungeons/dungeonThreatSystem"

export function formatThreatMeter(value: number): string {
  return `${Math.round(value)}%`
}

export function threatHudLines(threat: DungeonThreatState | undefined): string[] {
  if (!threat) return []
  const lines = [
    `Corruption ${formatThreatMeter(threat.corruptionPressure)}`,
    `Boss trace ${formatThreatMeter(threat.bossAwareness)}`,
  ]
  const whisper = bossAwarenessWhisperLine(threat.bossAwareness)
  if (whisper) lines.push(whisper)
  return lines
}
