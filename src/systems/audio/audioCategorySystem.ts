import { playAudioCue } from "./audioSystem"
import { playThemedCue } from "./themedAudioSystem"
import type { DungeonTheme } from "@/contracts/dungeon-contract"

export type AudioCategory =
  | "training"
  | "contract"
  | "dungeon_enter"
  | "boss"
  | "corruption_alert"
  | "sector_clear"
  | "relic_drop"
  | "rank_up"

const CATEGORY_CUES: Record<AudioCategory, Parameters<typeof playAudioCue>[0]> = {
  training: "encounterStart",
  contract: "confirm",
  dungeon_enter: "encounterStart",
  boss: "corruptionSting",
  corruption_alert: "corruptionSting",
  sector_clear: "sectorClear",
  relic_drop: "rewardCascade",
  rank_up: "confirm",
}

export function playCategoryStem(
  category: AudioCategory,
  theme?: DungeonTheme
): void {
  if (category === "dungeon_enter" && theme) {
    playThemedCue(theme, "enter")
    return
  }
  playAudioCue(CATEGORY_CUES[category])
}
