import type { PlayerPenaltyContract } from "@/contracts/player-contract"

export const CORRUPTION_UI_THRESHOLD = 25
export const CORRUPTION_HIGH_THRESHOLD = 50
export const FATIGUE_UI_THRESHOLD = 40
export const FATIGUE_HIGH_THRESHOLD = 65

export interface PenaltyPresentation {
  shellClass: string
  encounterClass: string
  transitionSlow: boolean
}

export function getPenaltyPresentation(
  penalties: PlayerPenaltyContract
): PenaltyPresentation {
  const classes: string[] = []
  const encounter: string[] = []

  if (penalties.corruption >= CORRUPTION_UI_THRESHOLD) {
    classes.push("nozomi-corruption-low")
    encounter.push("nozomi-corruption-low")
  }
  if (penalties.corruption >= CORRUPTION_HIGH_THRESHOLD) {
    classes.push("nozomi-corruption-high")
    encounter.push("nozomi-corruption-high")
  }
  if (penalties.fatigue >= FATIGUE_UI_THRESHOLD) {
    classes.push("nozomi-fatigue")
  }
  if (penalties.fatigue >= FATIGUE_HIGH_THRESHOLD) {
    classes.push("nozomi-fatigue-high")
  }

  return {
    shellClass: classes.join(" "),
    encounterClass: encounter.join(" "),
    transitionSlow: penalties.fatigue >= FATIGUE_UI_THRESHOLD,
  }
}
