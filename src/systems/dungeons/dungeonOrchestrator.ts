/** Thin facade — dungeon run flows live in dedicated modules. */

export { deployDungeon } from "./dungeonDeployFlow"
export {
  enterExplorationZone,
  advanceExplorationBeat,
} from "./dungeonExplorationFlow"
export { chooseDungeonRoute } from "./dungeonRouteFlow"
export { engageSectorEncounter } from "./dungeonEngagementFlow"
export {
  completeDungeonSector,
  advanceBossPhase,
  continueAfterReward,
} from "./dungeonProgressionFlow"
export {
  applyExtractionChoice,
  finalizeDungeonExtraction,
} from "./dungeonExtractionFlow"
export { applyEncounterAnswerConsequence } from "./dungeonConsequenceFlow"
export {
  failDungeonRun,
  registerEncounterFailure,
  shouldFailDungeon,
  type DungeonFailResult,
} from "./dungeonFailureFlow"
export { getDungeonBriefing } from "./dungeonBriefing"

export { listRouteChoices, initRouteRun } from "./dungeonRouteSystem"
export { isDungeonV2Run } from "./dungeonV2Helpers"
