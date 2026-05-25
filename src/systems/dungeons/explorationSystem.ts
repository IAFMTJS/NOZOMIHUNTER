import type {
  DungeonRunContract,
  DungeonTheme,
  ExplorationAction,
  ExplorationBeat,
} from "@/contracts/dungeon-contract"

export interface AdvanceExplorationResult {
  run: DungeonRunContract
  systemLine: string
  readyToEngage: boolean
}

export const PURSUIT_START_DISTANCE = 72
export const PURSUIT_CAUGHT_THRESHOLD = 12
export const PURSUIT_ESCAPE_THRESHOLD = 100

const BEAT_PROGRESS: Record<ExplorationBeat, number> = {
  APPROACH: 0,
  SCAN: 34,
  ENGAGE: 67,
}

const THEME_LINES: Record<
  DungeonTheme,
  { approach: Record<ExplorationAction, string>; scan: Record<ExplorationAction, string>; engage: string }
> = {
  CYBER_TOKYO: {
    approach: {
      LISTEN: "Neon static detected. Hold channel — abnormal signal ahead.",
      PUSH: "Forward momentum authorized. Corridor depth increasing.",
    },
    scan: {
      LISTEN: "Intercept complete. Sector vocabulary density elevated.",
      PUSH: "Scan skipped. Engagement proximity critical.",
    },
    engage: "Breach point locked. Encounter authorization available.",
  },
  SHADOW_ARCHIVE: {
    approach: {
      LISTEN: "Cold storage echoes. Archived voices bleed through.",
      PUSH: "Archive floor pressure rising. Proceed with caution.",
    },
    scan: {
      LISTEN: "Ghost data mapped. Listening sector likely.",
      PUSH: "Intel withheld. Archive Warden proximity unknown.",
    },
    engage: "Seal broken. Warden-class response imminent.",
  },
  ABYSS_CORE: {
    approach: {
      LISTEN: "Core hum detected. Signal density extreme.",
      PUSH: "Abyss corridor narrowing. No retreat lane.",
    },
    scan: {
      LISTEN: "Deep scan complete. Boss-tier terminology flagged.",
      PUSH: "Blind advance logged. Survival efficiency degraded.",
    },
    engage: "Core breach authorized. Zero margin for decode failure.",
  },
  ABANDONED_STATION: {
    approach: {
      LISTEN: "Station relay faint. Something moves in the dark.",
      PUSH: "Corridor advance. Dust and dead air.",
    },
    scan: {
      LISTEN: "Relay decoded. Hostile vocabulary signatures found.",
      PUSH: "Forward push. Hostile presence unconfirmed.",
    },
    engage: "Sector threshold reached. Engage when ready.",
  },
  CORRUPTED_SHRINE: {
    approach: {
      LISTEN: "Ritual whispers on the channel. Corruption spike.",
      PUSH: "Shrine path descends. Corruption thickens.",
    },
    scan: {
      LISTEN: "Shrine lexicon indexed. Sacred terms flagged.",
      PUSH: "Unscanned advance. Corruption tolerance tested.",
    },
    engage: "Shrine gate open. Encounter field active.",
  },
  NEON_CITY: {
    approach: {
      LISTEN: "City noise filtered. Target signal isolated.",
      PUSH: "Street-level advance. Hostiles probable.",
    },
    scan: {
      LISTEN: "Urban intel acquired. Conversation sector likely.",
      PUSH: "Rapid advance. Intel incomplete.",
    },
    engage: "Street breach ready. Deploy response.",
  },
}

function themeLines(theme: DungeonTheme) {
  return THEME_LINES[theme] ?? THEME_LINES.CYBER_TOKYO
}

export function initExplorationFields(): Pick<
  DungeonRunContract,
  "explorationProgress" | "explorationBeat" | "sectorIntelRevealed"
> {
  return {
    explorationProgress: BEAT_PROGRESS.APPROACH,
    explorationBeat: "APPROACH",
    sectorIntelRevealed: false,
  }
}

export function initPursuitDistance(): number {
  return PURSUIT_START_DISTANCE
}

export function clampPursuitDistance(value: number): number {
  return Math.max(0, Math.min(PURSUIT_ESCAPE_THRESHOLD, value))
}

export function adjustPursuitDistance(
  current: number,
  delta: number
): number {
  return clampPursuitDistance(current + delta)
}

export function pursuitDeltaForExploration(action: ExplorationAction): number {
  return action === "LISTEN" ? 6 : -4
}

/** Corruption tick when pushing corridor without listening first. */
export function explorationCorruptionDelta(action: ExplorationAction): number {
  return action === "PUSH" ? 1 : 0
}

export function isPursuitCaught(distance: number | undefined): boolean {
  return (distance ?? PURSUIT_START_DISTANCE) <= PURSUIT_CAUGHT_THRESHOLD
}

export function isPursuitEscaped(distance: number | undefined): boolean {
  return (distance ?? 0) >= PURSUIT_ESCAPE_THRESHOLD
}

export function pursuitThreatLabel(distance: number | undefined): string {
  const d = distance ?? PURSUIT_START_DISTANCE
  if (d <= PURSUIT_CAUGHT_THRESHOLD) return "Contact imminent"
  if (d < 35) return "Hostile closing"
  if (d < 55) return "Pursuit active"
  if (d >= PURSUIT_ESCAPE_THRESHOLD) return "Extraction window"
  return "Distance holding"
}

export function isReadyToEngage(run: DungeonRunContract): boolean {
  return run.explorationBeat === "ENGAGE" && (run.explorationProgress ?? 0) >= BEAT_PROGRESS.ENGAGE
}

export function explorationBeatLabel(beat: ExplorationBeat | null | undefined): string {
  switch (beat) {
    case "APPROACH":
      return "Approach corridor"
    case "SCAN":
      return "Scan sector"
    case "ENGAGE":
      return "Breach ready"
    default:
      return "Corridor transit"
  }
}

export function advanceExploration(
  run: DungeonRunContract,
  action: ExplorationAction
): AdvanceExplorationResult {
  const beat = run.explorationBeat ?? "APPROACH"
  const lines = themeLines(run.dungeon.theme)

  if (beat === "ENGAGE") {
    return {
      run,
      systemLine: lines.engage,
      readyToEngage: true,
    }
  }

  if (beat === "APPROACH") {
    const nextRun: DungeonRunContract = {
      ...run,
      explorationBeat: "SCAN",
      explorationProgress: BEAT_PROGRESS.SCAN,
      sectorIntelRevealed: action === "LISTEN" || run.sectorIntelRevealed === true,
    }
    return {
      run: applyPursuitToRun(nextRun, action),
      systemLine: lines.approach[action],
      readyToEngage: false,
    }
  }

  const intelRevealed = action === "LISTEN" || run.sectorIntelRevealed === true
  const nextRun: DungeonRunContract = {
    ...run,
    explorationBeat: "ENGAGE",
    explorationProgress: BEAT_PROGRESS.ENGAGE,
    sectorIntelRevealed: intelRevealed,
  }
  return {
    run: applyPursuitToRun(nextRun, action),
    systemLine: lines.scan[action],
    readyToEngage: true,
  }
}

function applyPursuitToRun(
  run: DungeonRunContract,
  action: ExplorationAction
): DungeonRunContract {
  if (run.pursuitDistance == null) return run
  return {
    ...run,
    pursuitDistance: adjustPursuitDistance(
      run.pursuitDistance,
      pursuitDeltaForExploration(action)
    ),
  }
}

export function sectorIntelHint(run: DungeonRunContract): string | null {
  if (!run.sectorIntelRevealed) return null
  const slot = run.dungeon.encounters[run.currentEncounterIndex]
  if (!slot) return "Tactical intel: encounter type unknown."
  return `Tactical intel: next sector type ${slot.type}. Prepare accordingly.`
}
