export type SystemMessageCategory =
  | "OBSERVATION"
  | "WARNING"
  | "ANTICIPATION"
  | "ACKNOWLEDGMENT"

export const SYSTEM_MESSAGE_POOLS: Record<SystemMessageCategory, readonly string[]> = {
  OBSERVATION: [
    "The weak have no right to choose.",
    "Threat recognition increased.",
    "Operator metrics within acceptable variance.",
    "Registry acknowledges your presence.",
    "Exploration beat registered. Sector response logged.",
  ],
  WARNING: [
    "Synchronization unstable.",
    "Preparation incomplete.",
    "Corruption threshold approaching.",
    "Fatigue degrading combat efficiency.",
    "Discipline chain at risk — deploy today.",
    "Deployment flagged as risky. Operator assumes liability.",
  ],
  ANTICIPATION: [
    "Next gate detected. Readiness advised.",
    "Sector pressure rising beyond current clearance.",
    "Corridor access pending extraction prerequisite.",
    "You are not cleared for the approaching sector.",
  ],
  ACKNOWLEDGMENT: [
    "Rank elevation noted. Do not stagnate.",
    "Level threshold crossed. System recalibrating.",
    "Discipline chain maintained. Continue.",
    "Discipline milestone unlocked. Registry updated.",
  ],
}
