export interface DisciplineResearchNode {
  id: string
  label: string
  cost: number
  unlockKey?: string
  description: string
}

export const DISCIPLINE_RESEARCH_NODES: DisciplineResearchNode[] = [
  {
    id: "research:accuracy",
    label: "Focus calibration",
    cost: 12,
    unlockKey: "system:training-advanced",
    description: "+5% accuracy bonus from relic synergy preview",
  },
  {
    id: "research:corruption-shield",
    label: "Void seal theory",
    cost: 12,
    description: "Reduces corruption spike severity on wrong answers",
  },
  {
    id: "title:operator-analyst",
    label: "Operator analyst title",
    cost: 8,
    unlockKey: "title:operator-analyst",
    description: "Cosmetic registry title",
  },
]
