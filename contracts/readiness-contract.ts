export type SurvivalBand =
  | "CRITICAL"
  | "UNSTABLE"
  | "STABLE"
  | "OPTIMAL"

export interface ReadinessFactorContract {
  id: string
  label: string
  impact: number
}

/**
 * Deploy checklist. `skillLoadout` is satisfied when tutorial is complete,
 * player level ≥ 2, or any skill stat (vocabulary/listening/speaking/grammar) ≥ 1.
 */
export interface PreparationChecklistContract {
  equipment: boolean
  skillLoadout: boolean
  consumables: boolean
  vocabulary: boolean
}

export interface ReadinessResultContract {
  preparationScore: number
  survivalBand: SurvivalBand
  survivalLabel: string
  factors: ReadinessFactorContract[]
  checklist?: PreparationChecklistContract
}
