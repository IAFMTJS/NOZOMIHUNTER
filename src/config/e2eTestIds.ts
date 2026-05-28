/** Stable selectors for Playwright / QA — keep in sync with flows/navigation-flow.md */
export const E2E_TEST_IDS = {
  trainingPlay: (modeId: string) => `training-play-${modeId.toLowerCase().replace(/_/g, "-")}`,
  contractsRequest: "contracts-request",
  contractOpen: "contract-open",
  prepareDeploy: "prepare-deploy",
  dungeonEnter: "dungeon-enter",
  dungeonResume: "dungeon-resume",
  dungeonAbandon: "dungeon-abandon",
  dungeonAbort: "dungeon-abort",
  encounterTransmit: "encounter-transmit",
} as const
