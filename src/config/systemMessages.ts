export type SystemMessageCategory =
  | "OBSERVATION"
  | "WARNING"
  | "ANTICIPATION"
  | "ACKNOWLEDGMENT"
  | "DAILY_MAINTENANCE"
  | "SIDE_OPERATIONS"

export const SYSTEM_MESSAGE_POOLS: Record<SystemMessageCategory, readonly string[]> = {
  OBSERVATION: [
    "The weak have no right to choose.",
    "Threat recognition increased.",
    "Operator metrics within acceptable variance.",
    "Registry acknowledges your presence.",
    "Exploration beat registered. Sector response logged.",
    "Sector telemetry nominal. Continue observation.",
    "Anomaly density within expected parameters.",
    "Network acknowledges sustained operator presence.",
  ],
  WARNING: [
    "Synchronization unstable.",
    "Preparation incomplete.",
    "Corruption threshold approaching.",
    "Fatigue degrading combat efficiency.",
    "Discipline chain at risk — deploy today.",
    "Deployment flagged as risky. Operator assumes liability.",
    "Pursuit signature detected on peripheral channels.",
    "Language invasion vectors active — verify all tokens.",
    "Void proximity rising. Corridor discipline required.",
  ],
  ANTICIPATION: [
    "Next gate detected. Readiness advised.",
    "Sector pressure rising beyond current clearance.",
    "Corridor access pending extraction prerequisite.",
    "You are not cleared for the approaching sector.",
    "Roguelike mutation cycle pending. Modifier stack unknown.",
    "Live sector event window approaching. Prepare loadout.",
  ],
  ACKNOWLEDGMENT: [
    "Rank elevation noted. Do not stagnate.",
    "Level threshold crossed. System recalibrating.",
    "Discipline chain maintained. Continue.",
    "Discipline milestone unlocked. Registry updated.",
    "Entity capture logged. Threat index updated.",
    "Deep cover trust vector adjusted. Proceed.",
  ],
  DAILY_MAINTENANCE: [
    "Daily maintenance contracts indexed. Stabilize before sector drift.",
    "Registry requests routine containment. Complete today's sweep.",
    "Low-intensity contracts available — maintain operator readiness.",
    "Operational feed refreshed. Review instability index.",
  ],
  SIDE_OPERATIONS: [
    "Side operations channel open. Higher risk, higher yield.",
    "Narrative contracts detected. Proceed with caution.",
    "Exploratory deployments authorized from this channel.",
    "Contract rotation updated. Social pressure sectors available.",
  ],
}
