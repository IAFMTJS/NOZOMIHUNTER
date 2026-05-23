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
