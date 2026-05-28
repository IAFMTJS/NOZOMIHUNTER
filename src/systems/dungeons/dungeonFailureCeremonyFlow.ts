import type { DungeonMachineState } from "@/contracts/dungeon-contract"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

/** When the failure overlay should block the run UI (E2E: `dungeon-failure-ceremony`). */
export function shouldShowDungeonFailureCeremony(
  machineState: DungeonMachineState,
  dismissed: boolean
): boolean {
  return machineState === "FAILURE" && !dismissed
}

export const DUNGEON_FAILURE_CEREMONY_TEST_ID = E2E_TEST_IDS.dungeonFailureCeremony
