import type { DungeonTheme } from "@/contracts/dungeon-contract"
import { playAudioCue } from "./audioSystem"

export type ThemedAudioCue = "sector" | "extract" | "enter"

const THEME_ASSET_PATHS: Partial<
  Record<DungeonTheme, Partial<Record<ThemedAudioCue, string>>>
> = {
  CYBER_TOKYO: {
    sector: "/audio/cyber-sector.mp3",
    extract: "/audio/cyber-extract.mp3",
  },
  SHADOW_ARCHIVE: {
    sector: "/audio/archive-sector.mp3",
    extract: "/audio/archive-extract.mp3",
  },
}

function playAsset(path: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const audio = new Audio(path)
    void audio.play()
    return true
  } catch {
    return false
  }
}

export function playThemedCue(
  theme: DungeonTheme,
  cue: ThemedAudioCue
): void {
  const path = THEME_ASSET_PATHS[theme]?.[cue]
  if (path && playAsset(path)) return

  switch (cue) {
    case "enter":
      playAudioCue("encounterStart")
      break
    case "sector":
      playAudioCue("sectorClear")
      break
    case "extract":
      playAudioCue("questComplete")
      break
    default:
      break
  }
}
