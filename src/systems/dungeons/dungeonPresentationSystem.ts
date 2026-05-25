import type { DungeonRunContract, DungeonTheme, EncounterType } from "@/contracts/dungeon-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { modifierSummary } from "@/systems/dungeons/dungeonModifierSystem"
import {
  isPursuitCaught,
  isPursuitEscaped,
  pursuitThreatLabel,
} from "@/systems/dungeons/explorationSystem"

export function resolveDungeonModeLabel(mode: GameModeId | undefined): string {
  switch (mode) {
    case "CORRUPTION_RUN":
      return "Corruption Run"
    case "VOID_PURSUIT":
      return "Void Pursuit"
    case "ROGUELIKE_SECTOR":
      return "Roguelike Sector"
    case "ARCHIVIST_BOSS":
      return "Archivist Protocol"
    default:
      return "Sector Breach"
  }
}

export function encounterTypeGlyph(type: EncounterType): string {
  switch (type) {
    case "VOCAB":
      return "語"
    case "LISTENING":
      return "♪"
    case "SPEECH":
      return "声"
    case "NPC":
      return "話"
    case "BOSS":
      return "核"
    default:
      return "?"
  }
}

export function encounterTypeLabel(type: EncounterType): string {
  switch (type) {
    case "VOCAB":
      return "Lexicon breach"
    case "LISTENING":
      return "Signal intercept"
    case "SPEECH":
      return "Voice relay"
    case "NPC":
      return "Hostile dialogue"
    case "BOSS":
      return "Warden"
    default:
      return "Unknown"
  }
}

export function corridorAtmosphereClass(theme: string | undefined, sectorIndex: number): string {
  const parts = ["nozomi-corridor-stage"]
  if (theme === "SHADOW_ARCHIVE") parts.push("nozomi-corridor--archive")
  else if (theme === "ABYSS_CORE") parts.push("nozomi-corridor--abyss")
  else parts.push("nozomi-corridor--cyber")
  if (sectorIndex >= 2) parts.push("nozomi-corridor--deep")
  if (sectorIndex >= 3) parts.push("nozomi-corridor--unstable")
  return parts.join(" ")
}

export function dungeonRunShellClass(run: DungeonRunContract): string {
  const parts = ["nozomi-dungeon-run"]
  const mode = run.dungeonMode
  if (mode === "VOID_PURSUIT") parts.push("nozomi-dungeon-run--pursuit")
  if (mode === "CORRUPTION_RUN") parts.push("nozomi-dungeon-run--corruption")
  if (mode === "ROGUELIKE_SECTOR") parts.push("nozomi-dungeon-run--roguelike")
  if ((run.endlessSectorCount ?? 0) >= 3) parts.push("nozomi-dungeon-run--unstable")
  const depth = Math.min(4, run.currentEncounterIndex + 1)
  if (depth >= 1) parts.push(`nozomi-dungeon-depth-${depth}`)
  return parts.join(" ")
}

export function pursuitBarTone(distance: number | undefined): string {
  const d = distance ?? 72
  if (isPursuitCaught(d)) return "critical"
  if (d < 35) return "danger"
  if (d < 55) return "warning"
  if (isPursuitEscaped(d)) return "safe"
  return "neutral"
}

export function formatRunPressure(run: DungeonRunContract): {
  modeLabel: string
  modifierText: string
  pursuitLabel: string | null
  loopLabel: string | null
} {
  return {
    modeLabel: resolveDungeonModeLabel(run.dungeonMode),
    modifierText: modifierSummary(run.modifiers),
    pursuitLabel:
      run.pursuitDistance != null
        ? pursuitThreatLabel(run.pursuitDistance)
        : null,
    loopLabel:
      run.dungeonMode === "CORRUPTION_RUN" && (run.endlessSectorCount ?? 0) > 0
        ? `Loop ${run.endlessSectorCount} — system instability rising`
        : null,
  }
}

export function sectorNodeLabel(
  index: number,
  type: EncounterType,
  completed: boolean
): string {
  const status = completed ? "cleared" : "locked"
  return `S${index + 1} · ${encounterTypeLabel(type)} · ${status}`
}

const THEME_ATMOSPHERE: Record<string, string> = {
  CYBER_TOKYO: "Neon grid — signal towers humming",
  SHADOW_ARCHIVE: "Corrupted archives — ink static",
  ABYSS_CORE: "Memory prison — void pressure",
  ABANDONED_STATION: "Abandoned relay — cold corridors",
  CORRUPTED_SHRINE: "Shrine breach — seal fractures",
  NEON_CITY: "City overload — pursuit channels hot",
}

export function dungeonThemeAtmosphere(theme: DungeonTheme | string | undefined): string {
  if (!theme) return "Sector breach — atmospheric lock engaged"
  return THEME_ATMOSPHERE[theme] ?? "Unknown sector — corruption detected"
}

export function dungeonFailureConsequenceLine(
  run: DungeonRunContract,
  maxStrikes: number
): string | null {
  const strikesLeft = Math.max(0, maxStrikes - run.encounterFailures)
  if (strikesLeft <= 0) return "Extraction compromised — penalties incoming"
  if (strikesLeft === 1) return "Final strike — next failure drains XP"
  if (run.encounterFailures > 0) return `Corruption +${run.encounterFailures * 3}% from breaches`
  return null
}
